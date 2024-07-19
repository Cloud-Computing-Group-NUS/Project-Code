import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import logging
import threading
import time
# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 全局变量
INSTRUCTIONS = "You are a personal coding tutor. Fix the coding problem with the given code."
api_key = os.environ.get('OPENAI_API_KEY')
client = OpenAI()
app = Flask(__name__)
CORS(app)

def create_assistant(model_id="gpt-3.5-turbo"):
    assistant = client.beta.assistants.create(
    name="Code Tutor",
    instructions=INSTRUCTIONS,
    model=model_id,
    )
    return assistant

assistant=create_assistant()

def create_thread():
    # history file
    thread=client.beta.threads.create()
    # else:
        # message_file = client.files.create(file=open(message_file_path,'rb'),purpose='assistants')
        # thread = client.beta.threads.create(
        #     messages=[
        #         {
        #             "role":"user",
        #             "content":message,
        #             "attachments":[
        #                 {"file_id": message_file.id, "tools": [{"type": "file_search"}]}
        #             ]
        #         }
        #     ]
        # )
    return thread

thread=create_thread()

conversation = []
conversation_lock = threading.Lock()
is_cancelled = False

def get_latest_model():
    return client.models.list().data[-1].id

def update_assistant():
    model_id = get_latest_model()
    response = client.beta.assistants.update(assistant_id=assistant.id, model=model_id)
    print(response)

def submit_message(assistant_id,thread_id,user_message):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_message
    )
    return client.beta.threads.runs.create(thread_id=thread_id,assistant_id=assistant_id)


def wait_on_run(thread_id,message,assistant_id):
    run=submit_message(assistant_id,thread_id,message)
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        time.sleep(0.5)

    messages = client.beta.threads.messages.list(thread_id=thread_id)
    print("messages",messages)
    # 提取assistant的回答
    for message in messages:
        if message.role == 'assistant':
            for content in message.content:
                if content.type == 'text':
                    print(content.text.value)
                    return content.text.value


def process_message(message):
    global conversation, is_cancelled
    try:
        # with conversation_lock:
            # conversation.append({"role": "user", "content": message})
            # messages = [{"role": "system", "content": INSTRUCTIONS}] + conversation
            

        if is_cancelled:
            return "对话已被取消"

        assistant_message = wait_on_run(thread.id, message, assistant.id)

        with conversation_lock:
            conversation.append({"role": "assistant", "content": assistant_message})

        return assistant_message
    except Exception as e:
        logger.error(f"处理消息时出错: {str(e)}")
        return f"处理消息时出错: {str(e)}"

@app.route('/ai_agent', methods=['POST'])
def ai_agent():
    global is_cancelled
    if is_cancelled:
        return jsonify({"error": "对话已被取消"}), 400

    data = request.json
    message = data.get('content', '')
    
    result = process_message(message)
    return jsonify({"content": result})

@app.route('/cancel', methods=['POST'])
def cancel():
    global is_cancelled
    is_cancelled = True
    response = client.beta.threads.delete(thread_id=thread.id)
    print(response)
    return jsonify({"status": "对话已被取消"}), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)