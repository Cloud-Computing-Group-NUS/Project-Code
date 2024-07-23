# AI System

## AI-Agent

- This part invokes Openai API to send a message and receive an answer. In particular, it creates an assistant and maintain a thread during the conversation
- It is supported by [OpenAI](https://openai.com) and [GPT-3](https://openai.com/gpt-3)

### Cloud Deployment

#### Obtain API Key

To obtain an API key, you need to sign up for an OpenAI account and log in to [OpenAI platform](https://platform.openai.com/api-keys).

- Student 1: Boxuan Hu, t0933356.
- Student 2: Xiliang Xian, t0933753.
- Student 3: Xinyuan Xia, t0933528.
- Student 4: Shuyang Zhou, t0933418.

<a href="https://github.com/Cloud-Computing-Group-NUS/Project-Code/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Cloud-Computing-Group-NUS/Project-Code" />
</a>


#### Dockerize the application

### 1.1 Project Description

This system is an AI-assisted document editor based on Kubernetes, integrating multiple components such as a frontend interface, backend processing, data preprocessing, message queue, data storage, knowledge base generation, and AI interaction.

The whole system is designed with scalability, high availability, and efficient data processing in mind, aiming to provide a smooth and intelligent document editing experience.

It leverages LLM to improve user development efficiency and fully collects and utilizes various data generated during user development to enhance the accuracy of the dedicated model and enrich its knowledge base.

### 1.2 System Architecture

![1721286190834](image/README/1721286190834.png)

__Main Function__

- AI-assisted document editor based on Kubernetes and Cloud
- Multiple components for efficient and intelligent document editing
- Collecting data when using for a project-tailored AI

### 1.3 Key Components

- **Frontend Pod**: User interface for document input and editing.
- **Preprocessing Pods**: Cleanses and formats input data.
- **Context Organizer Pod / Cloud Drive**: Formats content for display and interaction.
- **Message Queue**: Temporary data storage and transmission.
- **OpenAI Interaction Job**: Uses AI-assistant to handle requests.
- **Knowledge Base File Generation**: Create structured knowledge files.
- **MongoDB Database**: Persistent document storage.
- **Backend API Pod**: Uses correction messages from mongoDB Database to finetune a new model.

## 2. Quick Start

You can visit [here]() to explore this App (updated on 18/07/2024)

## 3. Environment Setup

### 3.1 Prerequisites

List all the prerequisites needed to set up the environment.

- **Node.js**:
  - Version: v22.4.1
  - Installation: [node-Installation](https://nodejs.org/zh-cn/download/package-manager/)
  
- __React__:
  - Version: @18.3.1
  - Installation: [react-Installation](https://react.dev/learn/installation)
  
- **Python:**

  - Version: 3.10.12
  - Installation: [python-Installation](https://www.python.org/downloads/)

- **AWS CLI:**

  - Installation: [AWS-CLI-Installation](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  
- **Kubectl:**

  - Installation: [Kubectl-Installtion](https://docs.aws.amazon.com/eks/latest/userguide/install-kubectl.html)

- **Python Library:**

  - ```bash
    pip install -r requirements.txt
    ```

### 3.2 Installation

> Tips: Actually, this part (3.2) is not necessary if you just want to experience our App rather than deploying it.

__Structure__

- main
  - [README.md](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/main/README.md "README.md")
- AI-system
  - AI Agent
    - Dockerfile
    - ai-agent.py
  - AI Finetune
    - Dockerfile
    - finetune.py
- Kubenetes
  - client
    - Dockerfile
    - client.py
- Drive
  - cloud
    - Dockerfile
    - server.py
- Web
  - [README.md](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/README.md "README.md")
  - Local Deployment
    - [public](https://github.com/Cloud-Computing-Group-NUS/Project-Code/tree/Web/public "public")
    - [src](https://github.com/Cloud-Computing-Group-NUS/Project-Code/tree/Web/src "src")
    - [nginx.conf](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/nginx.conf "nginx.conf")
  - Cloud Deployment
    - [Dockerfile](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/Dockerfile "Dockerfile")
    - [dependencies.txt](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/dependencies.txt "dependencies.txt")
    - [package-lock.json](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/package-lock.json "package-lock.json")
    - [package.json](https://github.com/Cloud-Computing-Group-NUS/Project-Code/blob/Web/package.json "package.json")


#### 3.2.1 Local Deployment WebUI

**Step 1**: Clone and Checkout

```bash
cd ai-agent
docker build -t <your dockerhub name>/ai-agent .
docker push <your dockerhub name>/ai-agent
```

Then change image name in   `ai-deployment.yaml` to `<your dockerhub name>/ai-agent`.

For the second, no additional steps are needed.

#### Modify the secrets

In this part, we've used a k8s object `secret` to protect our API key. First run the following command to encode your API key:

```bash
echo -n "<your_api_key>`" | base64
```

for example:

```bash
echo -n "sk-1234567890" | base64
```

Then replace the value of `api-key` in `ai-secrets.yaml` with the output of the above command.

#### Deploy the application

#### 3.2.2 AI Agent Deployment

**Obtain API Key**

To obtain an API key, you need to sign up for an OpenAI account and log in to [OpenAI platform](https://platform.openai.com/api-keys).

To use `assistant` and `finetune`, you may need to top up some money (like 5 dollars) in advance through a foreign credit card (American credit card works for me).

**Dockerize the application**

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
cd ai-agent
docker build -t <your dockerhub name>/ai-agent:v1 .
docker push <your dockerhub name>/ai-agent:v1
```

Then change image name in  `ai-deployment-2.yaml` to `<your dockerhub name>/ai-agent:v1`.

For the second, no additional steps are needed.

__Modify the secrets__

In this part, we've used a k8s object `secrets` to protect our API key. First run the following command to encode your API key:

```bash
echo -n "<your_api_key>`" | base64
```

for example:

```bash
echo -n "sk-1234567890" | base64
```

Then replace the value of `api-key` in `ai-secrets-2.yaml` with the output of the above command.

**Deploy the application**

After connecting to the cloud and forms a cluster, you can run the following code to build the application:

```bash
git checkout AI-system
cd ai-agent
kubectl apply -f ai-secrets-2.yaml
kubectl apply -f ai-service-2.yaml
kubectl apply -f ai-deployment-2.yaml
```

#### 3.2.3 AI Finetune Deployment

**Obtain API Key**

Follow instructions from AI-agent. finetune has been bound to the same secret in `finetune-deployment-2.yaml`

**Dockerize the application**

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
git checkout finetune
cd finetune
docker build -t <your dockerhub name>/finetune:v1 .
docker push <your dockerhub name>/finetune:v1
```

Then change image name in `finetune-deployment-2` yaml to `<your dockerhub name>/finetune:v1`.

For the second, no additional steps are needed.

**Deploy the application**

After create a cluster successfully, run the following command **in order** to build the finetune part:

```bash
kubectl apply -f aws-finetune-pv.yaml
kubectl apply -f aws-finetune-pvc.yaml
kubectl apply -f finetune-service-2.yaml
kubectl apply -f finetune-deployment-2.yaml
```

Note that finetune is rather costly.

#### 3.2.4 Cloud Drive Deployment

**Dockerize Cloud Drive**

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
git checkout Drive
cd cloud
docker build -t <your dockerhub name>/cloud:v1 .
docker push <your dockerhub name>/cloud:v1
```

Then change image name in `cloud-deployment` yaml to `<your dockerhub name>/cloud:v1`.

For the second, no additional steps are needed.

**Deploy Cloud Drive**

Run the following command **in order** to build the cloud drive:

```bash
kubectl apply -f aws-cloud-pv.yaml
kubectl apply -f aws-cloud-pvc.yaml
kubectl apply -f cloud-service.yaml
kubectl apply -f cloud-deployment.yaml
```

#### 3.2.5 Mongodb and Client Deployment

The Mongodb image is pulled from the official dockerhub.

**Deploy Mongodb**

Run the following command **in order** to build the Mongo database:

```bash
kubectl apply -f aws-mongodb-pv.yaml
kubectl apply -f aws-mongodb-pvc.yaml
kubectl apply -f mongodb-service.yaml
kubectl apply -f mongodb-secrets.yaml
kubectl apply -f mongodb-deployment.yaml
```

In any case, `deployment.yaml` should be applied in the last step.

**Dockerize the client**

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
git checkout Kubernetes
cd client
docker build -t <your dockerhub name>/client:v1 .
docker push <your dockerhub name>/client:v1
```

Then change image name in `client-deployment` yaml to `<your dockerhub name>/client:v1`.

For the second, no additional steps are needed.

**Deploy Mongodb Client**

Run the following command **in order** to build the Mongodb client:

```
kubectl apply -f client-service-2.yaml
kubectl apply -f client-deployment-2.yaml
```

#### 3.2.6 Transit Deployment

**Dockerize the Transiter**

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
git checkout Transit
cd transit
docker build -t <your dockerhub name>/tran:v1 .
docker push <your dockerhub name>/tran:v1
```

Then change image name in `transit-deployment` yaml to `<your dockerhub name>/tran:v1`.

For the second, no additional steps are needed.

**Deploy the Transiter**

Run the following command **in order** to build the cloud drive:

```bash
kubectl apply -f transit-rbac.yaml
kubectl apply -f transit-service.yaml
kubectl apply -f transit-deployment.yaml
```

```bash
cd finetune
docker build -t <your dockerhub name>/finetune .
docker push <your dockerhub name>/finetune
```

Here are brief information concerning application deployment. You can get detailed steps in __3. Environment Setup__

For the second, no additional steps are needed.

- WebUI Deployment

  - Get source code
  - Initialization
  - Run the web page
- AI System (AI Agent / AI Finetune)

  - Obtain API Key
  - Dockerize the application
  - Deploy the application
- Cloud Drive Deployment
  - Dockerize Cloud Drive
  - Deploy Cloud Drive
- Mongodb and Client Deployment
  - Deploy Mongodb
  - Dockerize the client
  - Deploy Mongodb Client
- Transit Deployment
  - Dockerize the Transiter
  - Deploy the Transiter


