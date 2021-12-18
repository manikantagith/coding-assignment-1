const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const modifyTodoObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  };
};

const checkPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const checkCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const checkCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const checkCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const checkStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const checkPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const priorityList = ["HIGH", "MEDIUM", "LOW"];
const statusList = ["TO DO", "IN PROGRESS", "DONE"];
const categoryList = ["WORK", "HOME", "LEARNING"];

const isPriorityValid = (priority) => {
  return priorityList.includes(priority);
};

const isStatusValid = (status) => {
  return statusList.includes(status);
};

const isCategoryValid = (category) => {
  return categoryList.includes(category);
};

const isDateValid = (date) => {
  return isValid(new Date(date));
};

//API 1

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  switch (true) {
    case checkPriorityAndStatus(request.query):
      if (isPriorityValid(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (isStatusValid(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        getTodosQuery = `
                SELECT *
                FROM todo
                WHERE
                    todo LIKE '%${search_q}%'
                    AND status = '${status}'
                    AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObject) => modifyTodoObject(eachObject)));
        break;
      }
    case checkCategoryAndPriority(request.query):
      if (isPriorityValid(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else if (isCategoryValid(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND category = '${category}'
                        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObject) => modifyTodoObject(eachObject)));
        break;
      }
    case checkCategoryAndStatus(request.query):
      if (isCategoryValid(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else if (isStatusValid(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND category = '${category}'
                        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
        break;
      }
    case checkPriority(request.query):
      if (isPriorityValid(priority) === false) {
        response.status(400);
        response.send("Invalid Todo Priority");
      } else {
        getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND priority = '${priority}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
        break;
      }
    case checkStatus(request.query):
      if (isStatusValid(status) === false) {
        response.status(400);
        response.send("Invalid Todo Status");
      } else {
        getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND status = '${status}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
        break;
      }
    case checkCategory(request.query):
      if (isCategoryValid(category) === false) {
        response.status(400);
        response.send("Invalid Todo Category");
      } else {
        getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%'
                        AND category = '${category}';`;
        data = await database.all(getTodosQuery);
        response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
        break;
      }
    default:
      getTodosQuery = `
                    SELECT *
                    FROM todo
                    WHERE
                        todo LIKE '%${search_q}%';`;
      data = await database.all(getTodosQuery);
      response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
  }
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(modifyTodoObject(todo));
});

//API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  if (isDateValid(date) === true) {
    const formatDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoQuery = `SELECT * FROM todo WHERE due_date = '${formatDate}';`;
    const data = await database.all(getTodoQuery);
    response.send(data.map((eachObjet) => modifyTodoObject(eachObjet)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (isPriorityValid(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (isStatusValid(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (isCategoryValid(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (isDateValid(dueDate) === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const formatDate = format(new Date(dueDate), "yyyy-MM-dd");
    const postTodoQuery = `
                    INSERT INTO
                        todo (id, todo, priority, status, category, due_date)
                    VALUES (${id}, '${todo}', '${priority}', '${status}', '${category}', '${formatDate}');`;
    await database.run(postTodoQuery);
    response.send("Todo Successfully Added");
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  if (requestBody.status !== undefined) {
    if (isStatusValid(requestBody.status) === false) {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      updateTodoQuery = `
                        UPDATE todo
                        SET status = '${requestBody.status}'
                        WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send("Status Updated");
    }
  } else if (requestBody.priority !== undefined) {
    if (isPriorityValid(requestBody.priority) === false) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      updateTodoQuery = `
                        UPDATE todo
                        SET priority = '${requestBody.priority}'
                        WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send("Priority Updated");
    }
  } else if (requestBody.todo !== undefined) {
    updateTodoQuery = `
                    UPDATE todo
                    SET todo = '${requestBody.todo}'
                    WHERE id = ${todoId};`;
    await database.run(updateTodoQuery);
    response.send("Todo Updated");
  } else if (requestBody.category !== undefined) {
    if (isCategoryValid(requestBody.category) === false) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      updateTodoQuery = `
                        UPDATE todo
                        SET category = '${requestBody.category}'
                        WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send("Category Updated");
    }
  } else if (requestBody.dueDate !== undefined) {
    if (isDateValid(requestBody.dueDate) === false) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      const formatDate = format(new Date(requestBody.dueDate), "yyyy-MM-dd");
      updateTodoQuery = `
                        UPDATE todo
                        SET due_date = '${requestBody.dueDate}'
                        WHERE id = ${todoId};`;
      await database.run(updateTodoQuery);
      response.send("Due Date Updated");
    }
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
