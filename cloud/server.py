from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import os
import shutil
import logging
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# 配置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

PV_ROOT = os.environ.get('PV_ROOT', '/app/data')

def get_full_path(file_path):
    return os.path.abspath(os.path.join(PV_ROOT, file_path.lstrip('/')))

def read_dir_recursive(dir_path):
    result = []
    for root, dirs, files in os.walk(dir_path):
        for dir_name in dirs:
            full_path = os.path.join(root, dir_name)
            relative_path = os.path.relpath(full_path, PV_ROOT)
            result.append({
                'id': relative_path,
                'name': dir_name,
                'type': 'folder',
                'children': read_dir_recursive(full_path)
            })
        for file_name in files:
            full_path = os.path.join(root, file_name)
            relative_path = os.path.relpath(full_path, PV_ROOT)
            result.append({
                'id': relative_path,
                'name': file_name,
                'type': 'file'
            })
    return result

def initialize_pv():
    logger.info(f"Initializing PV at {PV_ROOT}")
    if not os.path.exists(PV_ROOT):
        os.makedirs(PV_ROOT, exist_ok=True)
        logger.info(f"Created root directory at {PV_ROOT}")
    elif os.path.isdir(PV_ROOT) and not os.listdir(PV_ROOT):
        logger.info(f"PV is empty. Creating root folder.")
        os.makedirs(os.path.join(PV_ROOT, 'root'), exist_ok=True)
    else:
        logger.info(f"PV already initialized at {PV_ROOT}")

@app.route('/api/initialFileSystem', methods=['GET'])
def get_initial_file_system():
    logger.info("Received request for initial file system")
    try:
        initialize_pv()
        file_system = read_dir_recursive(PV_ROOT)
        logger.info(f"Returning file system with {len(file_system)} root items")
        return jsonify(file_system)
    except Exception as e:
        logger.error(f"Error in get_initial_file_system: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/saveFile', methods=['POST'])
def save_file():
    logger.info("Received request to save file")
    try:
        file_data = request.json['file']
        file_path = get_full_path(file_data['id'])
        
        logger.info(f"Saving file to path: {file_path}")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w') as f:
            f.write(file_data['content'])
        
        logger.info("File saved successfully")
        return jsonify({'message': 'File saved successfully'}), 200
    except Exception as e:
        logger.error(f"Error in save_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/createFile', methods=['POST'])
def create_file():
    logger.info("Received request to create file")
    try:
        parent_id = request.json['parentId']
        file_name = secure_filename(request.json['name'])
        file_type = request.json.get('type', 'file')
        
        parent_path = get_full_path(parent_id)
        new_path = os.path.join(parent_path, file_name)
        
        logger.info(f"Creating {'folder' if file_type == 'folder' else 'file'} at path: {new_path}")
        
        if file_type == 'folder':
            os.makedirs(new_path, exist_ok=True)
        else:
            # Ensure the parent directory exists
            os.makedirs(os.path.dirname(new_path), exist_ok=True)
            with open(new_path, 'w') as f:
                f.write('')
        
        relative_path = os.path.relpath(new_path, PV_ROOT)
        new_file = {
            'id': relative_path,
            'name': file_name,
            'type': file_type,
            'children': [] if file_type == 'folder' else None
        }
        
        logger.info(f"Created {'folder' if file_type == 'folder' else 'file'} successfully")
        return jsonify({'file': new_file}), 200
    except Exception as e:
        logger.error(f"Error in create_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/deleteFile', methods=['POST'])
def delete_file():
    logger.info("Received request to delete file")
    try:
        file_id = request.json['fileId']
        file_path = get_full_path(file_id)
        print(request.json)
        logger.info(f"Deleting file at path: {file_path}")
        
        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
            logger.info(f"Deleted folder: {file_path}")
        elif os.path.isfile(file_path):
            os.remove(file_path)
            logger.info(f"Deleted file: {file_path}")
        else:
            logger.warning(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
        
        return jsonify({'message': 'File deleted successfully'}), 200
    except Exception as e:
        logger.error(f"Error in delete_file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/getFileContent', methods=['GET'])
def get_file_content():
    logger.info("Received request to get file content")
    try:
        file_id = request.args.get('fileId')
        if not file_id:
            return jsonify({'error': 'No fileId provided'}), 400

        file_path = get_full_path(file_id)
        
        logger.info(f"Getting content of file: {file_path}")
        
        if not os.path.isfile(file_path):
            logger.warning(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404
        
        with open(file_path, 'r') as f:
            content = f.read()
        
        logger.info(f"Successfully read file content, length: {len(content)}")
        return jsonify({'content': content}), 200
    except Exception as e:
        logger.error(f"Error in get_file_content: {str(e)}")
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def handle_connect():
    logger.info('New client connected')

@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')

if __name__ == '__main__':
    logger.info("Starting the application")
    initialize_pv()
    port = 3001
    socketio.run(app, host='0.0.0.0', port=port,allow_unsafe_werkzeug=True)