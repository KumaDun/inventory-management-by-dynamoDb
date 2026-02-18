# Inventory Management System (Spring Boot + DynamoDB + React)

This project is a reference implementation for an inventory/order service that prioritizes low-latency reads and predictable write behavior under burst traffic.

## Why DynamoDB for this project

DynamoDB is a good fit for this workload for two practical reasons:

1. Scalability without capacity planning bottlenecks
- Inventory and order traffic is usually spiky (promotions, batch updates, retries).
- DynamoDB on-demand mode scales request throughput automatically, so you do not need to resize a relational instance during peaks.

2. Low and stable latency for key-based access
- Core operations in this codebase are key-centric (`GetItem`, `Query`, atomic `UpdateItem`) rather than join-heavy reporting.
- DynamoDB is designed for single-digit millisecond access on these patterns, which keeps API response times stable as data volume grows.

The trade-off is intentional: complex ad-hoc filtering and relational joins are harder. For this service, predictable latency on known access patterns is more important.

AWS references:
- DynamoDB introduction: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
- DynamoDB on-demand capacity mode: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/on-demand-capacity-mode.html
- Best practices for designing with DynamoDB: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html

## Current scope

Implemented:
- Inventory CRUD-style endpoints (`/api/items/post`, `/api/items/get`, `/api/items/all`, `/api/items/delete`)
- Order create/delete endpoints (`/api/orders/add`, `/api/orders/delete`)
- DynamoDB-backed persistence using AWS SDK v2 + Enhanced Client
- Frontend in `web/web` (Vite + React + Tailwind + shadcn setup)

Not implemented yet:
- Pagination
- Filtering

## TODO

- Add pagination for inventory and order listing APIs (cursor/`LastEvaluatedKey` based)
- Add server-side filtering support for inventory/order queries
- Add API contract docs (request/response examples + error model)
- Add integration tests against DynamoDB Local/Testcontainers
- Add CI pipeline (build + test + lint)

## Repository structure

- `src/main/java` - Spring Boot backend
- `pom.xml` - backend dependency management and build
- `src/main/resources/application.properties` - backend config (`PORT`, `aws.region`, table names)
- `web/web` - frontend (Vite + React + TypeScript)

## Data model (DynamoDB)

### Table: `InventoryItems`
- Partition key: `itemId` (String)
- Access patterns:
  - Get one item by id
  - Update item by id
  - Delete item by id
  - Scan/list all items (currently no pagination/filtering)

### Table: `OrderItems`
- Partition key: `customerId` (String)
- Sort key: `orderTime` (String, ISO-8601)
- GSI: `orderIdIndex` (partition key: `orderId`)
- Access patterns:
  - Query customer orders by time
  - Query by order id through GSI

## Local development (build + run)

## Prerequisites

- Java 17+ (JDK): https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
- Maven 3.9+ (or use included Maven Wrapper `mvnw`): https://maven.apache.org/install.html
- Node.js 20+ (includes npm): https://nodejs.org/en/download
- npm 10+ docs: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

IDE note:
- This project is a Maven project. In IntelliJ IDEA, import/open it as a Maven project so dependencies are resolved from `pom.xml` and `mvnw`.
- IntelliJ Maven docs: https://www.jetbrains.com/help/idea/maven-support.html

AWS credentials provider chain:
- The AWS SDK for Java v2 resolves credentials in a default order (for example: environment variables, shared credentials/config files, then attached IAM role credentials in AWS runtime environments).
- This project is build with a aws credentials in local environment. Cloners can choose any valid way to configure their aws credentials as listed in references.
- For local development, `aws configure` usually writes the shared files used by that chain.
- References:
  - Default credentials provider chain (Java v2): https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html
  - Shared `credentials` and `config` files: https://docs.aws.amazon.com/sdkref/latest/guide/file-format.html

## 1) Backend setup

From repo root:

```bash
./mvnw clean compile
./mvnw spring-boot:run
```

Backend runs on `http://localhost:5000` by default (`server.port=${PORT:5000}`).

Required AWS settings for local run:
- Region must match your DynamoDB tables (`aws.region` in `application.properties`, default `us-east-1`)
- Credentials must have DynamoDB permissions for both tables and `orderIdIndex`

Quick credential validation:

```bash
aws sts get-caller-identity
aws dynamodb list-tables --region us-east-1
```

## 2) Frontend setup (`web/web`)

```bash
cd web/web
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 3) shadcn usage and dependencies

This frontend is already configured for shadcn (`web/web/components.json` exists), but on a fresh checkout you should run:

```bash
cd web/web
npm install
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install -D shadcn
```

Initialize or re-initialize shadcn if needed:
This would a from scratch initialization of the frontend. See the ShadCn initialization reference here https://ui.shadcn.com/docs/installation

```bash
npx shadcn@latest init
```

Add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
```

If the init command prompts for paths, use values matching this repo:
- CSS file: `src/index.css`
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

## 4) Common local issue: CORS

If frontend (`5173`) calls backend (`5000`) directly, backend must return CORS headers.

This repo uses backend-side CORS config in `src/main/java/com/example/demo/config/WebCorsConfig.java` for:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

If you change frontend port or domain, update that file.

## Build guide (how to produce release artifacts)

## Backend artifact

From repo root:

```bash
./mvnw clean package
```

Expected artifact:
- `target/demo-0.0.1-SNAPSHOT.jar`

Run packaged JAR locally:

```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

## Frontend artifact

From `web/web`:

```bash
npm run build
```

Expected output:
- `web/web/dist`

## AWS deployment guide (detailed)

Below is a practical Elastic Beanstalk deployment path for the backend service.

## A. Create/verify DynamoDB resources

1. Choose one AWS region (example: `us-east-1`) and use it consistently.
2. Create `InventoryItems` table:
- Partition key: `itemId` (String)
- Capacity mode: On-demand
- Point-in-time recovery: Enabled
- Encryption: AWS owned key (or KMS if required by policy)
3. Create `OrderItems` table:
- Partition key: `customerId` (String)
- Sort key: `orderTime` (String)
- Capacity mode: On-demand
- Point-in-time recovery: Enabled
- Encryption: AWS owned key (or KMS)
4. Add GSI `orderIdIndex`:
- Partition key: `orderId` (String)
- Projection: `ALL` (or minimal fields if you optimize later)
5. Optional but recommended:
- CloudWatch alarms for throttled requests and system errors
- Backup policy and retention checks

## B. IAM roles and policies

You need two different IAM roles in Elastic Beanstalk deployments.

1. Elastic Beanstalk service role (environment management)
- Purpose: lets Elastic Beanstalk manage infrastructure resources.
- Typical managed policy: `AWSElasticBeanstalkEnhancedHealth` plus platform-required service policies.

2. EC2 instance profile role (application runtime permissions)
- Purpose: lets your Spring Boot app call DynamoDB from EC2 instances.
- Trust relationship: `ec2.amazonaws.com`
- Attach this role to the Elastic Beanstalk environment as instance profile.

Minimum application policy example (replace region/account):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:123456789012:table/InventoryItems",
        "arn:aws:dynamodb:us-east-1:123456789012:table/OrderItems",
        "arn:aws:dynamodb:us-east-1:123456789012:table/OrderItems/index/orderIdIndex"
      ]
    }
  ]
}
```

Validation checklist:
- EC2 instances in EB environment show expected IAM role
- `aws sts get-caller-identity` from instance returns expected principal
- App logs show no `AccessDeniedException`

## C. Package and deploy backend to Elastic Beanstalk

1. Build jar:

```bash
./mvnw clean package
```

2. Create EB application/environment:
- Platform: Java 17 (Amazon Linux 2023 branch)
- Environment type: single instance (dev) or load balanced (prod)
- Upload `target/demo-0.0.1-SNAPSHOT.jar`

3. Configure environment variables in EB:
- `PORT=5000`
- `AWS_REGION=us-east-1`
- Optional custom table names if you externalize them later

4. Attach IAM instance profile role from section B.

5. Health check and startup:
- Root endpoint: `GET /` should return `Greetings from Spring Boot!`
- Confirm environment health is Green

## D. Network and security settings

- Security group outbound must allow access to DynamoDB public endpoint (or use VPC endpoint if your policy requires private traffic).
- If using private subnets, ensure NAT or DynamoDB VPC endpoint is configured.
- Restrict inbound ports to LB/required clients only.

## E. Post-deploy verification

1. Verify environment status and logs in EB console.
2. Test backend endpoints from Postman/curl.
3. If frontend is hosted on another domain, update backend CORS allowed origins.
4. Monitor CloudWatch logs for latency spikes and throttling.

## API quick reference

Basic Postman testing:
1. Open Postman and create a new HTTP request.
2. Set method + URL using backend base URL: `http://localhost:5000`.
3. For `POST` requests, set `Body -> raw -> JSON` and `Content-Type: application/json`.
4. Send request and verify status code and response payload.
5. Save each request into a collection (for example: `Inventory API Local`) for reuse.

Data setup tip:
- You can directly create/edit records in the DynamoDB Console (`InventoryItems`, `OrderItems`).
- A practical test flow is: add one item in DynamoDB Console first, then call `GET /api/items/get` and `GET /api/items/all` from Postman to verify backend reads.

Example URLs in Postman:
- `GET http://localhost:5000/api/items/all`
- `GET http://localhost:5000/api/items/get?id=ITEM_001`
- `DELETE http://localhost:5000/api/items/delete?id=ITEM_001`
- `POST http://localhost:5000/api/orders/add`

Inventory:
- `POST /api/items/post`
- `GET /api/items/get?id={itemId}`
- `GET /api/items/all`
- `DELETE /api/items/delete?id={itemId}`

Orders:
- `POST /api/orders/add`
- `DELETE /api/orders/delete?customerId={id}&orderTime={isoTime}`

## Build philosophy for this repo

This README is intentionally both:
- How to use: run locally, call APIs, debug common issues
- How to build: understand data model decisions, extend features (pagination/filtering), and deploy safely to AWS

If you are continuing development, start with TODO items for pagination and filtering because they affect API contract, DynamoDB access patterns, and frontend list screens.
