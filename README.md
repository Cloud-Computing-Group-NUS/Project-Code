# IntelliDoc

> Cloud-native AI-assisted Multi-person Real-time Collaboration Document System Based On K8s

__Team Number__: SWS-3004, Group 6

__Team Member__:

We are DATA @ Summer Workshop, NUS.

> DATA is a Department of data-Analysis and neTworked Architecting

- Student 1: Boxuan Hu, t0933356.
- Student 2: Xiliang Xian, t0933753.
- Student 3: Xinyuan Xia, t0933528.
- Student 4: Shuyang Zhou, .

## 1. Project Overview

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

You can visit [here]() to explore this App

## 3. Environment Setup

### 3.1 Prerequisites

List all the prerequisites needed to set up the environment.

- **Node.js**:
  - Version: v22.4.1
  - Installation: [node-Installation](https://nodejs.org/zh-cn/download/package-manager/)
- __React__:
  - Version: @18.3.1
  - Installation: [react-Installation](https://react.dev/learn/installation)
- **Library 1**: Version and installation command.

### 3.2 Installation

#### 3.2.1 Local Deployment WebUI

> Tips: Actually, this part (2.2.1) is not necessary if you just want to experience our App rather than deploying it

**Step 1**: Clone and Checkout

```bash
git clone https://github.com/Cloud-Computing-Group-NUS/Project-Code.git
git checkout Web
```

**Step 2**: Initialization

```bash
npm install
npm start
```

And you will get this:

```bash
Compiled successfully!

You can now view cloud-drive-app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://172.31.34.17:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

Click the localhost and then you will get the UI in your browser:

![1721289370502](image/README/1721289370502.png)

#### 3.2.2 Local Deployment WebUI



#### 3.2.3 Local Deployment WebUI



#### 3.2.4 Local Deployment WebUI



## 4. Application Deployment

Here are detailed information concerning application deployment.

If you just want to experience our App rather than deploying it, please jump to __2. Quick Start__

1. **Step 1**: Description and command.

   ```bash
   command_to_run
   ```
2. **Step 2**: Description and command.

   ```bash
   command_to_run
   ```
