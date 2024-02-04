# Task Management System API Documentation

## APIs

### 1. Create Task
- **Path:** `<URL>/task/createTask`
- **Method:** POST
- **Input:**
  - Title (String)
  - Description (String)
  - Due Date (Date)
  - JWT Auth Token (Authorization Header)

### 2. Create Subtask
- **Path:** `<URL>/subTask/createSubTask`
- **Method:** POST
- **Input:**
  - Task ID (String)
	- Description (String)
  - JWT Auth Token (Authorization Header)

### 3. Get All User Tasks
- **Path:** `<URL>/task/getAllUserTask`
- **Method:** GET
- **Query Parameters:**
  - Priority (Optional, Integer)
  - Due Date (Optional, Date)
	- Status (Optional, Number)
	- Search (Optional, String) -> Search for titles that contains or matches the string
  - Pagination (Optional, Page Number and Page Size)
- **Authorization Header:** JWT Auth Token

### 4. Get All User Subtasks
- **Path:** `<URL>/subTask/getAllUserSubTasks`
- **Method:** GET
- **Query Parameters:**
  - Task ID (Optional, String)
	- Status (Optional, Number)
- **Authorization Header:** JWT Auth Token

### 5. Update Task
- **Path:** `<URL>/task/updateTask`
- **Method:** POST
- **Input:**
  - Due Date (Optional, Date)
  - Status (Optional, "TODO" or "DONE")
- **Authorization Header:** JWT Auth Token

### 6. Update Subtask
- **Path:** `<URL>/subTask/updateSubTask`
- **Method:** POST
- **Input:**
	- SubTaskId (String)
  - Status (0-"INCOMPLETE" or 1-"COMPLETE")

### 7. Delete Task (Soft Deletion)
- **Path:** `<URL>/task/deleteTask`
- **Method:** POST
- **Input:**
	- TaskId (String)
- **Authorization Header:** JWT Auth Token

### 8. Delete Subtask (Soft Deletion)
- **Path:** `<URL>/subTask/deleteSubTask`
- **Method:** POST
- **Input:**
	- SubTaskId (String)
- **Authorization Header:** JWT Auth Token

### 9. Callback URL from twilio to update user voice call status
- **Path:** `<URL>/user/getCallbackResponse`
- **Method:** POST
- **Input:**
	- CallSid (String)
	- CallStatus (String)

## Debug API

### 1. Create a user by providing a phone_number for testing
- **Path:** `<URL>/user/createUser`
- **Method:** POST
- **Input:**
	- PhoneNumber (String)

## Cron Jobs

### 1. Change Task Priority Based on Due Date
- **Logic:** Every day at midnight, check tasks due_date and update priority accordingly.

### 2. Voice Calling using Twilio for Overdue Tasks
- **Logic:** Every hour, check for overdue tasks. If found, initiate voice calling using Twilio.
  - Prioritize users based on priority (0 -> 1 -> 2).
  - Only call the next priority user if the previous one doesn't answer.

## Priority Explanation
- **Priority 0:** High Priority
- **Priority 1:** Medium Priority
- **Priority 2:** Low Priority

## How to test with Postman

1. Import ```taskManager-postman.postman_collection.json``` in your postman application.

2. Navigate to `Environments` and create an environment.

3. Add following variables and click save.
- `url`
- `authTk` - Everytime you call `user/createUser`, `auth_token` will be assigned to this variable.
- `taskId` - Everytime you create a new task with `task/createTask` endpoint the `_id` from response will be assigned to this variable.

