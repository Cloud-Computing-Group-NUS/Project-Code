# AI-Agent System

- This part invokes Openai API to send a message and receive an answer. In particular, it creates an assistant and maintain a thread during the conversation
- It is supported by [OpenAI](https://openai.com) and [GPT-3](https://openai.com/gpt-3)

## Cloud Deployment

### Obtain API Key

To obtain an API key, you need to sign up for an OpenAI account and log in to [OpenAI platform](https://platform.openai.com/api-keys).

To use `assistant` and `finetune`, you may need to top up some money (like 5 dollars) in advance through a foreign credit card (American credit card works for me).

### Dockerize the application

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
cd ai_agent
docker build -t <your dockerhub name>/ai-agent .
docker push <your dockerhub name>/ai-agent
```

Then change image name in   `ai-deployment.yaml` to `<your dockerhub name>/ai-agent`.

For the second, no additional steps are needed.

### Modify the secrets

In this part, we've used a k8s object `secret` to protect our API key. First run the following command to encode your API key:

```bash
echo -n "<your_api_key>`" | base64
```

for example:

```bash
echo -n "sk-1234567890" | base64
```

Then replace the value of `api-key` in `ai-secrets.yaml` with the output of the above command.

### Deploy the application

After connecting to the cloud and forms a cluster, you can run the following code to build the application:

```bash
cd ai_agent/
kubectl apply -f ai-secrets.yaml
kubectl apply -f ai-deployment.yaml
kubectl apply -f ai-service.yaml
```

## AI-finetune

- This part collects data from MongoDB database and uses it to finetune the model. As OpenAI needs to load the file stored in the local disk, we creates PV and PVC and mount it to PV.
- It is supported by [OpenAI](https://openai.com) and [GPT-3](https://openai.com/gpt-3)

### Cloud Deployment

#### Obtain API Key

 Follow instructions from AI-agent. finetune has been bound to the same secret from `ai_finetune_deployment.yaml`

#### Dockerize the application

You can either build a docker file locally or pull the image from our docker hub. For the first option, you can run the following command:

```bash
cd finetune
docker build -t <your dockerhub name>/finetune .
docker push <your dockerhub name>/finetune
```

Then change image name in   `ai_finetune_deployment.yaml` to `<your dockerhub name>/finetune`.

For the second, no additional steps are needed.

#### Deploy the application

After connecting to the cloud and forms a cluster, you can run the following code to build the application:

```bash
cd finetune/
kubectl apply -f ai_finetune_deployment.yaml
kubectl apply -f ai_finetune_service.yaml
kubectl apply -f ai_finetune_pvc.yaml
kubectl apply -f ai_finetune_pv.yaml
```

Note that finetune is rather costly.
