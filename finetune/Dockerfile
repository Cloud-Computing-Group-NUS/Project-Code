# Use the official Python image from the Docker Hub
FROM python:3.10.12

# Set the working directory in the container
WORKDIR /ai_finetune

# Copy the current directory contents into the container at /ai_agent
COPY . /ai_finetune

# # Install any needed packages specified in requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install Flask==3.0.3 Flask-Cors==4.0.1 requests==2.32.3 openai==1.35.12 python-dotenv==1.0.1 pymongo 
# Run app.py when the container launches
CMD ["python", "finetune.py"]
