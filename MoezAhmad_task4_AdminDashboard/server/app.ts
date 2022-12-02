import express from "express";
import { Student, List, Task, Admin } from "./db/types";
import bodyParser from "body-parser";
import { mongoose } from "./db/config/mongoose";
import http from "http";
import jwt from "jsonwebtoken";
const cors = require("cors");
const app = express();
mongoose;

/**
 * Middleware
 */

// Load middleware
app.use(bodyParser.json());

app.use(
  cors({
    credentials: true,
    exposedHeaders: ["x-access-token", "x-refresh-token", "_id"],
  })
);

let authenticateAdmin = (req: any, res: any, next: any) => {
  let token = req.headers["x-access-token"];
  // verify the JWT
  // @ts-ignore
  jwt.verify(token, Admin.getJWTSecret(), (err: any, decoded: any) => {
    if (err) {
      // there was an error
      // jwt is invalid - * DO NOT AUTHENTICATE *
      res.status(401).send(err);
    } else {
      req.admin_id = decoded._id;
      next();
    }
  });
};
let authenticateStudent = (req: any, res: any, next: any) => {
  let token = req.headers["x-access-token"];
  // verify the JWT
  // @ts-ignore
  jwt.verify(token, Student.getJWTSecret(), (err: any, decoded: any) => {
    if (err) {
      // there was an error
      // jwt is invalid - * DO NOT AUTHENTICATE *
      res.status(401).send(err);
    } else {
      req.student_id = decoded._id;
      next();
    }
  });
};

// Verify Refresh Token Middleware (which will be added to the GET /students/me/access-token route)
const verifySessionStudent = (req: any, res: any, next: any) => {
  // grab the refresh token from the request header
  let refreshToken = req.headers["x-access-token"];
  // grab the _id from the request header

  let _id = req.headers["_id"];
  // @ts-ignore
  Student.findByIdAndToken(_id, refreshToken)
    .then((student: any) => {
      if (!student) {
        // student couldn't be found
        return Promise.reject({
          error:
            "Student not found. Make sure that the refresh token and student id are correct",
        });
      }
      // if the code reaches here - the student was found
      // therefore the refresh token exists in the database - but we still have to check if it has expired or not
      // @ts-ignore
      req.student_id = student._id;
      // @ts-ignore
      req.studentObject = student;
      // @ts-ignore
      req.refreshToken = refreshToken;

      let isSessionValid = false;
      student.sessions.forEach((session: any) => {
        if (session.token === refreshToken) {
          // check if the session has expired
          // @ts-ignore
          if (Student.hasRefreshTokenExpired(session.expiresAt) === false) {
            // refresh token has not expired
            isSessionValid = true;
          }
        }
      });
      if (isSessionValid) {
        // call next() to continue with processing this web request
        next();
      } else {
        // refresh token has expired
        return Promise.reject({
          error: "Refresh token has expired or the session is invalid",
        });
      }
    })
    .catch((e: any) => {
      console.log(e);
      res.status(401).send(e);
    });
};
// Verify Refresh Token Middleware (which will be added to the GET /admiins/me/access-token route)
const verifySessionAdmin = (req: any, res: any, next: any) => {
  // grab the refresh token from the request header
  let refreshToken = req.headers["x-access-token"];
  // grab the _id from the request header

  let _id = req.headers["_id"];
  // @ts-ignore
  Admin.findByIdAndToken(_id, refreshToken)
    .then((admin: any) => {
      if (!admin) {
        // admin couldn't be found
        return Promise.reject({
          error:
            "admin not found. Make sure that the refresh token and admin id are correct",
        });
      }
      // if the code reaches here - the admin was found
      // therefore the refresh token exists in the database - but we still have to check if it has expired or not
      // @ts-ignore
      req.admin_id = admin._id;
      // @ts-ignore
      req.adminObject = admin;
      // @ts-ignore
      req.refreshToken = refreshToken;

      let isSessionValid = false;
      admin.sessions.forEach((session: any) => {
        if (session.token === refreshToken) {
          // check if the session has expired
          // @ts-ignore
          if (Admin.hasRefreshTokenExpired(session.expiresAt) === false) {
            // refresh token has not expired
            isSessionValid = true;
          }
        }
      });
      if (isSessionValid) {
        // call next() to continue with processing this web request
        next();
      } else {
        // refresh token has expired
        return Promise.reject({
          error: "Refresh token has expired or the session is invalid",
        });
      }
    })
    .catch((e: any) => {
      console.log(e);
      res.status(401).send(e);
    });
};

/**
 * End Middle ware
 */

app.get("/", (req, res) => {
  res.send("Hello World");
});
/*
 * GET /students
 * Purpose: Get all students
 */
app.get("/students", authenticateAdmin, (req, res) => {
  // We want to return an array of all students
  // in the database
  console.log("GET /students");
  Student.find().then((students) => {
    res.send(students);
  });
});

/*
 * PATCH /students/:id
 * Purpose: Update a student
 */
app.patch("/students/:id", authenticateAdmin, (req, res) => {
  // We want to update the specified student with the new values specified in the JSON body of the
  // request
  console.log({ ...req.body });
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
      res.status(400).send(e);
    });
});
/*
 * DELETE /students/:id
 * Purpose: Delete a student
 */
app.delete("/students/:id", authenticateAdmin, (req, res) => {
  // We want to delete the specified student
  Student.findOneAndDelete({ _id: req.params.id })
    .then((deletedStudentDocument) => {
      if (deletedStudentDocument === null) {
        return res.sendStatus(404);
      }
      res.send(deletedStudentDocument);
      deleteListsFromStudent(deletedStudentDocument._id);
      deleteTasksFromStudent(deletedStudentDocument._id);
    })
    .catch((e) => {
      res.status(400).send(e);
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
      res.status(400).send(e);
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
      res.status(400).send(e);
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
      res.status(400).send(e);
    });
});

/*
 * DELETE /students/:studentId/lists/:id
 * Purpose: Delete a list
 */
app.delete("/students/:studentId/lists/:id", (req, res) => {
  List.findOneAndDelete({
    _id: req.params.id,
    _studentId: req.params.studentId,
  })
    .then((deletedListDocument) => {
      if (deletedListDocument) {
        res.send(deletedListDocument);
        deleteTasksFromList(deletedListDocument._id);
      }
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

/*
 * GET /students/:studentId/lists/:listId/tasks
 * Purpose: Get all tasks of a list
 */
app.get("/students/:studentId/lists/:listId/tasks", (req, res) => {
  Task.find({
    _listId: req.params.listId,
  })
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

/*
 * POST /students/:studentId/lists/:listId/tasks
 * Purpose: Create a task in a list
 */
app.post("/students/:studentId/lists/:listId/tasks", (req, res) => {
  // We will create a task here
  let { title } = req.body;
  let newTask = new Task({
    title,
    _listId: req.params.listId,
    _studentId: req.params.studentId,
  });
  newTask
    .save()
    .then((newTaskDoc) => {
      res.send(newTaskDoc);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

/*
 * PATCH /students/:studentId/lists/:listId/tasks/:taskId
 * Purpose: update a task in a list
 */
app.patch("/students/:studentId/lists/:listId/tasks/:taskId", (req, res) => {
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
      res.status(400).send(e);
    });
});
/*
 * DELETE /students/:studentId/lists/:listId/tasks/:taskId
 * Purpose: delete a task in a list
 */
app.delete("/students/:studentId/lists/:listId/tasks/:taskId", (req, res) => {
  Task.findOneAndDelete({
    _id: req.params.taskId,
  })
    .then((deletedTaskDoc) => {
      res.send(deletedTaskDoc);
    })
    .catch((e) => {
      res.status(400).send(e);
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
      return res.status(400).send(e);
    });
});

/*
 * POST /students/login
 * Purpose: Sign in students
 */
app.post("/students/login", (req, res) => {
  // our login logic goes here
  let { email, password } = req.body;
  // @ts-ignore
  Student.findByCredentials(email, password)
    .then((student: any) => {
      return student
        .createSession()
        .then((refreshToken: any) => {
          // Session created successfully - refreshToken returned.
          // now we geneate an access auth token for the student
          return student.generateAccessAuthToken().then((accessToken: any) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken };
          });
        })
        .then((authTokens: any) => {
          // Now we construct and send the response to the student with their auth tokens in the header and the student object in the body
          res
            .header("x-refresh-token", authTokens.refreshToken)
            .header("x-access-token", authTokens.accessToken)
            .send(student);
        });
    })
    .catch((e: any) => {
      res.status(400).send(e);
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
      return res.status(400).send(e);
    });
});

/*
 * POST /admins/login
 * Purpose: Sign in admins
 */
app.post("/admins/login", (req, res) => {
  // our login logic goes here
  let { email, password } = req.body;
  console.log({ email, password });
  // @ts-ignore
  Admin.findByCredentials(email, password)
    .then((admin: any) => {
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
        });
    })
    .catch((e: any) => {
      return res.status(400).send(e);
    });
});

/**
 * GET /students/me/access-token
 * Purpose: generates and returns an access token
 */
app.get("/students/me/access-token", verifySessionStudent, (req, res) => {
  // we know that the student is authenticated and we have the student_id and user_type available to us
  // @ts-ignore
  req.studentObject
    .generateAccessAuthToken()
    .then((accessToken: any) => {
      res.header("x-access-token", accessToken).send({ accessToken });
    })
    .catch((e: any) => {
      res.status(400).send(e);
    });
});

app.get("/admins/me/access-token", verifySessionAdmin, (req, res) => {
  // we know that the admin is authenticated and we have the student_id and user_type available to us
  // @ts-ignore
  req.adminObject
    .generateAccessAuthToken()
    .then((accessToken: any) => {
      res.header("x-access-token", accessToken).send({ accessToken });
    })
    .catch((e: any) => {
      res.status(400).send(e);
    });
});

/* HELPER METHODS */
const deleteTasksFromList = (_listId: any) => {
  Task.deleteMany({
    _listId,
  }).then(() => {
    console.log("Tasks from " + _listId + " were deleted!");
  });
};

const deleteListsFromStudent = (_studentId: any) => {
  List.deleteMany({
    _studentId,
  }).then(() => {
    console.log("Lists from " + _studentId + " were deleted!");
  });
};
const deleteTasksFromStudent = (_studentId: any) => {
  Task.deleteMany({
    _studentId,
  }).then(() => {
    console.log("Tasks from " + _studentId + " were deleted!");
  });
};

const server = http.createServer(app);
const port = 3000;

server.listen(3000, () => {
  console.log(`Server running on port ${port}`);
});
