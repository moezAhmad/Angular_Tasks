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
 * GET /lists
 * Purpose: Get all lists
 */
app.get("/lists", async (req, res) => {
  List.find().then((lists) => {
    res.send(lists);
  });
});

/*
 * POST /lists
 * Purpose: Create a list
 */
app.post("/lists", (req, res) => {
  // We will create a student here
  let { title } = req.body;
  console.log({ title });
  let newList = new List({
    title,
  });
  newList
    .save()
    .then((listDoc) => {
      // the full list document is returned (incl. id)
      res.send(listDoc);
    })
    .catch((e) => {
      console.log(e);
      res.sendStatus(400);
    });
});

/*
 * PATCH /lists:id
 * Purpose: Update a list
 */
app.patch("/lists/:id", (req, res) => {
  List.findOneAndUpdate(
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
 * DELETE /lists:id
 * Purpose: Delete a student
 */
app.delete("/lists/:id", (req, res) => {
  List.findOneAndDelete({ _id: req.params.id })
    .then((deletedListDoc) => {
      res.send(deletedListDoc);
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
