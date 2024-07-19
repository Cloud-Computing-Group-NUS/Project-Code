from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
import os
import logging
from kubernetes import client, config
import threading
import uuid
import re

app = Flask(__name__)
CORS(app)

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kubernetes 配置
config.load_incluster_config()
batch_api = client.BatchV1Api()
core_api = client.CoreV1Api()

# 全局变量
CLOUD_DRIVE_SERVICE_URL = 'http://cloud-drive-service:80'
active_jobs = {}  # 用于跟踪每个用户的活动 Job
MAX_CONCURRENT_USERS = int(os.environ.get('MAX_CONCURRENT_USERS', 50))
MAX_RETRIES = 20
RETRY_DELAY = 2  # 秒

def read_file_content(file_id):
    """从 cloud-drive-service 读取文件内容"""
    try:
        response = requests.get(f'{CLOUD_DRIVE_SERVICE_URL}/api/getFileContent', params={'fileId': file_id})
        response.raise_for_status()
        return response.json()['content']
    except requests.RequestException as e:
        logger.error(f"获取文件内容时出错: {str(e)}")
        raise Exception(f"无法获取文件内容: {str(e)}")

def create_job(user):
    """创建 Kubernetes Job"""
    cleaned_user = re.sub(r'[^a-zA-Z0-9-]', '', user)
    if not cleaned_user:
        cleaned_user = "defaultuser"
    cleaned_user = cleaned_user[:20]
    
    job_name = f"ai-agent-job-{cleaned_user}-{uuid.uuid4().hex[:10]}"
    job_name = re.sub(r'^[^a-zA-Z0-9]|[^a-zA-Z0-9]$', 'a', job_name)[:63]

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(name=job_name),
        spec=client.V1JobSpec(
            template=client.V1PodTemplateSpec(
                spec=client.V1PodSpec(
                    containers=[
                        client.V1Container(
                            name="ai-agent",
                            image="xianxiliang/ai-agent9:v1",
                            ports=[client.V1ContainerPort(container_port=5000)],
                            command=["python", "ai-agent.py"],
                            readiness_probe=client.V1Probe(
                                http_get=client.V1HTTPGetAction(
                                    path="/health",
                                    port=5000
                                ),
                                initial_delay_seconds=10,
                                period_seconds=5
                            ),
                            env_from=[
                                client.V1EnvFromSource(
                                    secret_ref=client.V1SecretEnvSource(
                                        name="ai-agent-secret"
                                    )
                                )
                            ]
                        )
                    ],
                    restart_policy="Never"
                )
            )
        )
    )
    try:
        batch_api.create_namespaced_job(namespace="default", body=job)
        logger.info(f"为用户 {user} 创建了作业 {job_name}")
        return job_name
    except Exception as e:
        logger.error(f"为用户 {user} 创建作业失败: {str(e)}")
        return None

def wait_for_pod_ready(job_name):
    for _ in range(MAX_RETRIES):
        try:
            pod = core_api.list_namespaced_pod(namespace="default", label_selector=f"job-name={job_name}").items[0]
            if pod.status.phase == 'Running' and all(container.ready for container in pod.status.container_statuses):
                return pod
        except IndexError:
            pass
        time.sleep(RETRY_DELAY)
    raise Exception("Pod 未能在指定时间内就绪")

def process_request(user, content):
    if user not in active_jobs:
        if len(active_jobs) >= MAX_CONCURRENT_USERS:
            return jsonify({"error": "系统已达到最大用户数量，请稍后再试"}), 503
        job_name = create_job(user)
        if job_name:
            active_jobs[user] = job_name
        else:
            return jsonify({"error": "创建作业失败"}), 500

    try:
        pod = wait_for_pod_ready(active_jobs[user])
        pod_ip = pod.status.pod_ip
        response = requests.post(f"http://{pod_ip}:5000/ai_agent", json={"content": content}, timeout=30)
        if response.status_code == 200:
            return jsonify(response.json()), 200
        else:
            return jsonify({"error": f"AI agent 返回错误: {response.status_code}"}), 500
    except Exception as e:
        logger.error(f"与 AI agent 通信时出错: {str(e)}")
        return jsonify({"error": "处理请求失败"}), 500

@app.route('/get_chat_content', methods=['POST'])
def get_chat_content():
    """处理聊天内容请求"""
    data = request.json
    user = data.get('user', '')
    chat_content = data.get('content', '')
    file_id = data.get('file', '')

    logger.info(f"收到用户请求: {user}, 文件: {file_id}")

    if not file_id:
        logger.error("缺少文件 ID")
        return jsonify({"error": "需要提供文件 ID"}), 400

    try:
        file_content = read_file_content(file_id)
    except Exception as e:
        logger.error(f"读取文件内容失败: {str(e)}")
        return jsonify({"error": "读取文件内容失败"}), 500

    content = f'以下是与对话相关的文件内容，请基于以下文件内容做出接下来的回答：{file_content}\n以下是我的问题,请回答:{chat_content}'

    return process_request(user, content)

@app.route('/get_file_content', methods=['POST'])
def get_file_content():
    """处理文件内容请求"""
    data = request.json
    user = data.get('user', '')
    chat_content = data.get('content', '')
    file_id = data.get('file', '')
    
    try:
        file_content = read_file_content(file_id)
    except Exception as e:
        logger.error(f"读取文件内容失败: {str(e)}")
        return jsonify({"error": "读取文件内容失败"}), 500
    
    content = f'以下是你需要修改的文件内容，请将以下：{file_content}\n以下是我的问题，请回答:{chat_content}'
    
    return process_request(user, content)

@app.route('/job_status', methods=['GET'])
def job_status():
    """检查 Job 状态"""
    user = request.args.get('user')
    if not user:
        return jsonify({"error": "需要提供用户参数"}), 400

    if user in active_jobs:
        job_name = active_jobs[user]
        try:
            job = batch_api.read_namespaced_job_status(name=job_name, namespace="default")
            if job.status.active:
                return jsonify({"status": "running"}), 200
            elif job.status.succeeded:
                return jsonify({"status": "completed"}), 200
            elif job.status.failed:
                return jsonify({"status": "failed"}), 200
            else:
                return jsonify({"status": "unknown"}), 200
        except Exception as e:
            logger.error(f"检查用户 {user} 的作业状态时出错: {str(e)}")
            return jsonify({"error": "检查作业状态失败"}), 500
    else:
        return jsonify({"status": "没有活动的作业"}), 404

@app.route('/cancel', methods=['POST'])
def cancel():
    """取消用户的 Job"""
    data = request.json
    user = data.get("user")
    if not user:
        return jsonify({"error": "需要提供用户"}), 400

    if user in active_jobs:
        job_name = active_jobs[user]
        try:
            pod = core_api.list_namespaced_pod(namespace="default", label_selector=f"job-name={job_name}").items[0]
            pod_ip = pod.status.pod_ip
            # 发送取消请求到 AI agent
            requests.post(f"http://{pod_ip}:5000/cancel")
            # 删除 Kubernetes Job
            batch_api.delete_namespaced_job(name=job_name, namespace="default", body=client.V1DeleteOptions())
            del active_jobs[user]
            logger.info(f"已取消用户 {user} 的作业")
            return jsonify({"status": "作业已成功取消"}), 200
        except Exception as e:
            logger.error(f"取消用户 {user} 的作业失败: {str(e)}")
            return jsonify({"error": "取消作业失败"}), 500
    else:
        return jsonify({"status": "没有需要取消的活动作业"}), 404

@app.route('/get_train_data', methods=['POST'])
def get_train_data():
    """处理训练数据请求并转发到 AI agent"""
    data = request.json
    if not data:
        return jsonify({"error": "未提供数据"}), 400

    user = data.get('sender', '')
    content = data.get('content', '')
    timestamp = data.get('timestamp', '')
    prev_file = data.get('prevFile', '')
    ai_modified_content = data.get('aiModifiedContent', '')

    logger.info(f"收到用户 {user} 的训练数据")

    if user not in active_jobs:
        return jsonify({"error": "用户没有活动的 AI agent"}), 404

    # 构建要发送到 AI agent 的数据
    ai_request_data = {
        "sender": user,
        "content": content,
        "timestamp": timestamp,
        "prevFile": prev_file,
        "aiModifiedContent": ai_modified_content
    }

    try:
        pod = wait_for_pod_ready(active_jobs[user])
        pod_ip = pod.status.pod_ip
        # 发送请求到 AI agent 的 /generate 端点
        response = requests.post(f"http://{pod_ip}:5000/generate", json=ai_request_data, timeout=30)
        response.raise_for_status()
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"转发请求到 AI agent 时出错: {str(e)}")
        return jsonify({"error": "处理请求失败"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)