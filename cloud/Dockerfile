# FROM node:14
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install
# COPY . .
# EXPOSE 3001
# CMD [ "node", "server.js" ]

# FROM python:3.10.12
# WORKDIR /usr/src/app
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# EXPOSE 3001
# CMD [ "python", "server.py" ]

FROM python:3.9.7

WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 3001
ENV PV_ROOT=/app/data
RUN mkdir -p /app/data
CMD ["python", "server.py"]