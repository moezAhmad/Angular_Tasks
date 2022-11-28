import express from "express";
import { Student, List, Task, Admin } from "./db/types";
import bodyParser from "body-parser";
import { mongoose } from "./db/config/mongoose";
import http from "http";

const app = express();
mongoose;

// Load middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});
/*
 * GET /students
 * Purpose: Get all students
 */
app.get("/students", (req, res) => {
  // We want to return an array of all students
  // in the database
  Student.find().then((students) => {
    res.send(students);
  });
});

/*
 * PATCH /students/:id
 * Purpose: Update a student
 */
app.patch("/students/:id", (req, res) => {
  // We want to update the specified student with the new values specified in the JSON body of the
  // request
  Student.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});
/*
 * DELETE /students/:id
 * Purpose: Update a student
 */
app.delete("/students/:id", (req, res) => {
  // We want to delete the specified student
  Student.findOneAndDelete({ _id: req.params.id })
    .then((deletedStudentDocument) => {
      res.send(deletedStudentDocument);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * GET /students/:studentId/lists
 * Purpose: Get all lists of a student
 */
app.get("/students/:studentId/lists", async (req, res) => {
  // We want to return all lists that belong to a specified student
  List.find({
    _studentId: req.params.studentId,
  })
    .then((lists) => {
      res.send(lists);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * POST /students/:studentId/lists
 * Purpose: Create a list for a student
 */
app.post("/students/:studentId/lists", (req, res) => {
  // We want to create a new list and return the new list document back to the user (which includes the id)
  // The list information (fields) will be passed in via the JSON request body
  let { title } = req.body;

  let newList = new List({
    title,
    _studentId: req.params.studentId,
  });
  newList
    .save()
    .then((listDoc) => {
      // full list document
      res.send(listDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * PATCH /students/:studentId/lists/:id
 * Purpose: Update a list
 */
app.patch("/students/:studentId/lists/:id", (req, res) => {
  List.findOneAndUpdate(
    {
      _id: req.params.id,
      _studentId: req.params.studentId,
    },
    {
      $set: req.body,
    }
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * DELETE /students/:studentId/lists/:id
 * Purpose: Delete a student
 */
app.delete("/students/:studentId/lists/:id", (req, res) => {
  List.findOneAndDelete({
    _id: req.params.id,
    _studentId: req.params.studentId,
  })
    .then((deletedListDocument) => {
      res.send(deletedListDocument);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks of a list
 */
app.get("/lists/:listId/tasks", (req, res) => {
  Task.find({
    _listId: req.params.listId,
  })
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * POST /lists/:listId/tasks
 * Purpose: Create a task in a list
 */
app.post("/lists/:listId/tasks", (req, res) => {
  // We will create a task here
  let { title } = req.body;
  let newTask = new Task({
    title,
    _listId: req.params.listId,
  });
  newTask
    .save()
    .then((newTaskDoc) => {
      res.send(newTaskDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * PATCH /lists/:listId/tasks/:taskId
 * Purpose: update a task in a list
 */
app.patch("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndUpdate(
    {
      _id: req.params.taskId,
    },
    {
      $set: req.body,
    }
  )
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});
/*
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: delete a task in a list
 */
app.delete("/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndDelete({
    _id: req.params.taskId,
  })
    .then((deletedTaskDoc) => {
      res.send(deletedTaskDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/* Auth Routes*/

/*
 * POST /students
 * Purpose: Sign up students
 */
app.post("/students", async (req, res) => {
  // our register logic goes here...
  let { name, email, password } = req.body;
  console.log({ name, email, password });
  let newStudent = new Student({
    name,
    email,
    password,
  });
  newStudent
    .save()
    .then((studentDoc: any) => {
      return newStudent.createSession();
    })
    .then((refreshToken: any) => {
      // Session created successfully - refreshToken returned
      // now we generate an access auth token for the student
      return newStudent.generateAccessAuthToken().then((accessToken: any) => {
        // access auth token generated successfully, now we return an object containing the auth tokens
        return { accessToken, refreshToken };
      });
    })
    .then((authTokens: any) => {
      // Now construct and send the response to the student with their auth tokens in the header and the student object in the body
      res
        .header("x-refresh-token", authTokens.refreshToken)
        .header("x-access-token", authTokens.accessToken)
        .send(newStudent);
    })
    .catch((e: any) => {
      console.log(e);
      return res.sendStatus(400);
    });
});

/*
 * POST /students/login
 * Purpose: Sign in students
 */
app.get("/students/login", (req, res) => {
  // our login logic goes here
  let { email, password } = req.body;
  // @ts-ignore
  Student.findByCredentials(email, password).then((student: any) => {
    return student
      .createSession()
      .then((refreshToken: any) => {
        // Session created successfully - refreshToken returned
        // now we generate an access auth token for the student
        return student.generateAccessAuthToken().then((accessToken: any) => {
          // access auth token generated successfully, now we return an object containing the auth tokens
          return { accessToken, refreshToken };
        });
      })
      .then((authTokens: any) => {
        // Now construct and send the response to the student with their auth tokens in the header and the student object in the body
        res
          .header("x-refresh-token", authTokens.refreshToken)
          .header("x-access-token", authTokens.accessToken)
          .send(student);
      })
      .catch((e: any) => {
        console.log(e);
        return res.sendStatus(400);
      });
  });
});

/*
 * POST /admins
 * Purpose: Sign up admins
 */
app.post("/admins", async (req, res) => {
  // our register logic goes here...
  let { name, email, password } = req.body;
  console.log({ name, email, password });
  let newAdmin = new Admin({
    name,
    email,
    password,
  });
  newAdmin
    .save()
    .then((adminDoc: any) => {
      return newAdmin.createSession();
    })
    .then((refreshToken: any) => {
      // Session created successfully - refreshToken returned
      // now we generate an access auth token for the student
      return newAdmin.generateAccessAuthToken().then((accessToken: any) => {
        // access auth token generated successfully, now we return an object containing the auth tokens
        return { accessToken, refreshToken };
      });
    })
    .then((authTokens: any) => {
      // Now construct and send the response to the student with their auth tokens in the header and the student object in the body
      res
        .header("x-refresh-token", authTokens.refreshToken)
        .header("x-access-token", authTokens.accessToken)
        .send(newAdmin);
    })
    .catch((e: any) => {
      console.log(e);
      return res.sendStatus(400);
    });
});

/*
 * POST /admins/login
 * Purpose: Sign in admins
 */
app.get("/admins/login", (req, res) => {
  // our login logic goes here
  let { email, password } = req.body;
  // @ts-ignore
  Admin.findByCredentials(email, password).then((admin: any) => {
    return admin
      .createSession()
      .then((refreshToken: any) => {
        // Session created successfully - refreshToken returned
        // now we generate an access auth token for the admin
        return admin.generateAccessAuthToken().then((accessToken: any) => {
          // access auth token generated successfully, now we return an object containing the auth tokens
          return { accessToken, refreshToken };
        });
      })
      .then((authTokens: any) => {
        // Now construct and send the response to the admin with their auth tokens in the header and the admin object in the body
        res
          .header("x-refresh-token", authTokens.refreshToken)
          .header("x-access-token", authTokens.accessToken)
          .send(admin);
      })
      .catch((e: any) => {
        console.log(e);
        return res.sendStatus(400);
      });
  });
});

const server = http.createServer(app);
const port = 3000;

server.listen(3000, () => {
  console.log(`Server running on port ${port}`);
});
