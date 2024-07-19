from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
import time
import schedule
import requests
import threading

app = Flask(__name__)

# MongoDB 连接信息
mongo_host = os.environ.get('MONGO_HOST', 'mongo-nodeport-svc')
mongo_port = int(os.environ.get('MONGO_PORT', 27017))
mongo_user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'adminuser')
mongo_password = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'password123')

# 构建 MongoDB URI
mongo_uri = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}"

# 创建一个 MongoDB 客户端
client = MongoClient(mongo_uri)
db = client['testdb']
collection = db['testcollection']

# 接收数据
@app.route('/save', methods=['POST'])
def save_data():
    try:
        data = request.json
        if not data or 'messages' not in data:
            return jsonify({"error": "Invalid data format"}), 400
        result = collection.insert_one(data)
        print(f"Data received and stored with ID: {result.inserted_id}")
        return jsonify({"message": "Data received and stored", "id": str(result.inserted_id)}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# thread传回数据库格式：
# {"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "What's the capital of France?"}, {"role": "assistant", "content": "Paris, as if everyone doesn't know that already."}]}
# {"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "Who wrote 'Romeo and Juliet'?"}, {"role": "assistant", "content": "Oh, just some guy named William Shakespeare. Ever heard of him?"}]}
# {"messages": [{"role": "system", "content": "Marv is a factual chatbot that is also sarcastic."}, {"role": "user", "content": "How far is the Moon from Earth?"}, {"role": "assistant", "content": "Around 384,400 kilometers. Give or take a few, like that really matters."}]}


# 发送数据
def send_data():
    try:
        data = list(collection.find({}, {'_id': 0}))
        print(f"Sending data: {data}")
        # 发送数据到指定端口
        response = requests.post('http://finetune:80/finetune', json=data)
        
        if response.status_code == 200:
            # 如果发送成功，清空集合
            collection.delete_many({})
            print("Data sent successfully and database cleared")
        else:
            print(f"Failed to send data. Status code: {response.status_code}")
    except Exception as e:
        print(f"Error sending data: {e}")

# # 设置定时任务
schedule.every().day.at("00:00").do(send_data)

# 运行定时任务的函数
def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(30)

if __name__ == "__main__":
    # 在后台线程中运行定时任务
    threading.Thread(target=run_schedule, daemon=True).start()
    # 运行 Flask 应用
    app.run(host='0.0.0.0', port=3000)