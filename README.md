# Distributed Load Testing System

A cloud-native distributed load testing platform designed to simulate large numbers of virtual users, generate traffic against target applications, collect real-time performance metrics, and produce final performance reports.

The system uses containerized workers, autoscaling, metrics collection, and a centralized controller to help developers and DevOps teams evaluate how applications behave under heavy traffic.

---

## Overview

This project is a scalable load testing system that allows users to define, run, monitor, and analyze performance tests for web applications, APIs, and backend services.

Instead of running all test traffic from a single machine, the system distributes the load across multiple worker containers. These workers generate requests to the target application while the platform collects metrics such as response time, request rate, error rate, CPU usage, memory usage, and active virtual users.

---

## Key Features

* Create and manage load test configurations
* Simulate thousands of virtual users
* Run distributed worker containers
* Automatically scale workers based on test demand
* Collect real-time performance metrics
* Monitor tests through dashboards
* Generate final test reports
* Track success rate, failure rate, latency, and throughput
* Support API load testing with custom methods, headers, and payloads
* Provide a safe structure for authorized performance testing

---

## System Architecture

```text
User / Dashboard
        |
        v
Load Test API / Controller
        |
        v
Test Scheduler / Orchestrator
        |
        v
Message Queue
        |
        v
Worker Containers
        |
        v
Target Application

Workers ---> Metrics Collector ---> Prometheus / Grafana
Controller ---> Database
```

---

## Main Components

### 1. Frontend Dashboard

The frontend allows users to create, start, stop, and monitor load tests.

Users can configure:

* Target URL
* HTTP method
* Number of virtual users
* Test duration
* Ramp-up time
* Headers
* Request body
* Expected response time
* Stop conditions

---

### 2. Backend Controller

The backend controller is responsible for managing the full lifecycle of a load test.

Responsibilities include:

* Creating test configurations
* Validating user input
* Saving tests to the database
* Starting and stopping tests
* Calculating the number of workers needed
* Sending jobs to workers
* Collecting test results
* Generating test summaries

---

### 3. Worker Containers

Workers are responsible for generating traffic.

Each worker receives test instructions from the controller and simulates a portion of the total virtual users.

Example:

```text
1 worker = 500 virtual users

10,000 virtual users / 500 users per worker = 20 workers
```

Workers collect and report:

* Total requests
* Successful requests
* Failed requests
* Response times
* Timeout errors
* HTTP status codes
* CPU usage
* Memory usage

---

### 4. Message Queue

A message queue is used to decouple the controller from the workers.

The controller sends test jobs to the queue, and workers consume those jobs when they are ready.

Possible queue technologies:

* Redis Streams
* RabbitMQ
* Kafka
* NATS

---

### 5. Autoscaling

The system supports autoscaling to increase or reduce the number of workers depending on test requirements.

Autoscaling can be based on:

* Number of virtual users
* CPU usage
* Memory usage
* Worker load
* Queue size
* Request latency

In a Kubernetes deployment, autoscaling can be handled using:

* Kubernetes Horizontal Pod Autoscaler
* KEDA
* Prometheus metrics

---

### 6. Metrics and Monitoring

Metrics are collected during test execution and displayed in real time.

Important metrics include:

* Requests per second
* Average response time
* Minimum response time
* Maximum response time
* 95th percentile response time
* 99th percentile response time
* Error rate
* Successful requests
* Failed requests
* Active workers
* Active virtual users
* CPU usage
* Memory usage

Recommended monitoring tools:

* Prometheus
* Grafana
* InfluxDB
* TimescaleDB

---

## Recommended Tech Stack

| Layer            | Technology                               |
| ---------------- | ---------------------------------------- |
| Frontend         | React, Tailwind CSS                      |
| Backend API      | Node.js, NestJS, Express                 |
| Workers          | Node.js                                  |
| Database         | PostgreSQL                               |
| Queue            | Redis Streams,                           |
| Containerization | Docker                                   |
| Orchestration    | Kubernetes                               |
| Autoscaling      | Kubernetes HPA, KEDA                     |
| Metrics          | Prometheus                               |
| Dashboard        | React dashboard                          |

---

## Example Test Configuration

```json
{
  "name": "Login API Stress Test",
  "targetUrl": "https://example.com/api/login",
  "method": "POST",
  "virtualUsers": 10000,
  "duration": "15m",
  "rampUp": "1000 users/min",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "email": "test@example.com",
    "password": "password123"
  }
}
```

---

## API Endpoints

Example backend endpoints:

```text
POST   /tests
GET    /tests
GET    /tests/:id
POST   /tests/:id/start
POST   /tests/:id/stop
GET    /tests/:id/metrics
GET    /tests/:id/report
```

---

## Database Design

Example main tables:

```text
users
tests
test_runs
workers
test_metrics
reports
```

Example `tests` table:

```text
id
user_id
name
target_url
method
duration
virtual_users
ramp_up_time
status
created_at
updated_at
```

Example `test_runs` table:

```text
id
test_id
started_at
ended_at
status
total_requests
successful_requests
failed_requests
average_response_time
p95_response_time
p99_response_time
error_rate
```

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/distributed-load-testing-system.git
cd distributed-load-testing-system
```

### 2. Install dependencies

```bash
npm install
```

Or, if the backend and frontend are separated:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Create environment file

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/loadtesting
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
PROMETHEUS_URL=http://localhost:9090
```

### 4. Start services with Docker Compose

```bash
docker-compose up -d
```

### 5. Run the application

```bash
npm run dev
```

---

## Docker Usage

Build the worker image:

```bash
docker build -t loadtest-worker ./worker
```

Run a worker container:

```bash
docker run --env-file .env loadtest-worker
```

---

## Kubernetes Deployment

The system can be deployed on Kubernetes using manifests or Helm charts.

Example deployment flow:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/controller.yaml
kubectl apply -f k8s/workers.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## Test Execution Flow

```text
1. User creates a load test from the dashboard.
2. Backend saves the test configuration.
3. User starts the test.
4. Controller calculates the required number of workers.
5. Worker containers are started.
6. Controller sends test jobs to the queue.
7. Workers generate traffic against the target application.
8. Metrics are collected in real time.
9. Dashboard displays test progress.
10. Test ends after the configured duration.
11. Final report is generated.
```

---

## Final Report

At the end of each test, the system generates a report containing:

* Total requests
* Successful requests
* Failed requests
* Average response time
* Minimum response time
* Maximum response time
* 95th percentile response time
* 99th percentile response time
* Error rate
* Throughput
* Bottleneck observations
* Recommended improvements

Example report summary:

```text
The target application handled 8,500 users successfully.
Failures increased after 9,000 users.
Average response time exceeded 2 seconds after 7,200 users.
The database layer appears to be the main bottleneck.
```

---

## Security and Responsible Usage

This system must only be used to test applications, APIs, or services that you own or have permission to test.

Recommended safety features:

* User authentication
* Domain ownership verification
* Rate limits
* Test size limits
* Abuse detection
* Audit logs
* Permission-based access control

Unauthorized load testing can be considered a denial-of-service attack.

---

## Future Improvements

* Team accounts and roles
* Scheduled load tests
* CI/CD pipeline integration
* Advanced test scripting
* Geographic worker distribution
* WebSocket load testing
* GraphQL load testing
* AI-based bottleneck analysis
* Export reports as PDF
* Billing and usage limits for SaaS deployment

---

## Project Status

This project is currently in the design and development phase.

Planned development phases:

```text
Phase 1: Basic test creation and execution
Phase 2: Worker container support
Phase 3: Metrics dashboard
Phase 4: Autoscaling with Kubernetes
Phase 5: Final reporting and analytics
Phase 6: Production deployment
```

---

## License

This project is licensed under the MIT License.

---

## Author

Developed as a cloud-native software engineering project for distributed load testing, autoscaling, container orchestration, and real-time performance monitoring.
