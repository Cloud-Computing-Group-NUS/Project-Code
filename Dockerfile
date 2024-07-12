# # 使用官方的 Node 运行时作为基础镜像
# FROM node:14-alpine

# # 设置容器内的工作目录
# WORKDIR /app

# # 拷贝 package.json 和 package-lock.json（如果有的话）
# COPY package*.json ./

# # 安装依赖
# RUN npm install

# # 拷贝整个React应用到容器中
# COPY . .

# # 构建React应用
# RUN npm run build

# # 设置启动应用的命令（根据你的启动脚本进行替换）
# CMD ["npm", "start"]

# Build stage
FROM node:14 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf
# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html
# Copy our Nginx config
COPY nginx.conf /etc/nginx/conf.d/
# Expose port 80
EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
