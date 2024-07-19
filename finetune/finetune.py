from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from pymongo import MongoClient
import os


# init Flask
app = Flask(__name__)
CORS(app)

# init GPT
# load_dotenv()
api_key = load_dotenv("OPENAI_API_KEY")

client=OpenAI()

# receive data from "database": 
# service: finetune

# finetune the model and send the new model name to ai_server_gpt_multi_thread

def save_to_jsonl(data, filename):
    try:
        # 首先清空文件
        open(filename, 'w').close()
        
        # 然后以追加模式打开文件并写入数据
        with open(filename, 'a') as f:
            for item in data:
                f.write(json.dumps(item) + '\n')
        print(f"Data successfully saved to {filename}")
    except IOError as e:
        print(f"An error occurred while writing to the file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


@app.route('/finetune',methods=['POST'])
def receive_data():
    # init mongoDB:
    mongo_host = os.environ.get('MONGO_HOST', 'mongo-nodeport-svc')
    mongo_port = int(os.environ.get('MONGO_PORT', 27017))
    mongo_user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'adminuser')
    mongo_password = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'password123')
    mongo_uri = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}"

    client = MongoClient(mongo_uri)
    db = client['testdb']
    collection = db['testcollection']
    documents = list(collection.find({}, {'_id': 0}))

    file_name='/ai_finetune/data.json'
    save_to_jsonl(documents,file_name)

    # data = request.json
    # with open('/ai_finetune/data.json','w') as f:
    #     for values in data.values():
    #         f.write(json.dumps(values)+'\n')
    file_id=upload_finetune_file(file_name)
    return finetune(file_id)
    

def get_model_name():
    models = client.models.list().data
    filtered_models = [model for model in models if 'gpt-3.5-turbo' in model.id or 'ft' in model.id]
    if filtered_models:
        return filtered_models[-1].id
    return 'gpt-3.5-turbo'  # 或者返回一个默认值，表示没有找到符合条件的模型


def upload_finetune_file():
    file=client.files.create(file=open('/ai_finetune/data.json','rb'),purpose="fine-tune")
    return file.id

    # model_name=get_model_name()
    # client.fine_tuning.create(training_file='/ai_finetune/data.json',model=model_name)

        
def finetune(file_id):
    client.fine_tuning.jobs.create(
        training_file=file_id,
        model=get_model_name(),
        hyperparameters={
            "n_epochs":2}
    )

    # finetune the model
    # send the new model name to ai_server_gpt_multi_thread
    return jsonify({"success": True})

def main():
    print("Starting AI Finetune Server")
    app.run(host='0.0.0.0', port=80)

if __name__ == "__main__":
    main()