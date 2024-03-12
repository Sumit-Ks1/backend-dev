# 👁️ YOUTUBE CREATION (Go to YOUTUBE DEVELOPMENT in E drive)
## npm i -D preetier to make our lines of code similar to others working on same project. and then we make a .prettierignore to avoid some files that are not to be provided tabspaces of 2 or equally .
## We create a file  called .prettierrc and write 
- {
-  "singleQuote": false,
-  "bracketSpacing": true,
-  "tabWidth": 2,
-  "trailingComma": "es5",
-  "semi": true
- }
## Then I connected database with my backend. For that I have to first create a database and then connect it through a link which I get from that , basically I have to copy that link to .env file(dotenv is a lightweight npm package that automatically loads environment variables from a .env file into the process.env object) as it contains the sensitive info and that is my database link and its password (assigned to a variable) . And we will then connect it through mongoose line mongoose.connect(`${process.env.VariableName}/${DB_NAME}) in index.js file in db folder . 
## Made utils to make them use different in files multiple times . Therefore I made the code Write once Use Anywhere.
## In utils, we are having ApiError.js , so that any error come in website , it goes through ApiError.js , for this we need to include middlewares in between them (Errror to reach ApiError.js).
## We use mongoose-aggregate-paginate-v2 simplifies pagination for Mongoose aggregation results, making it easier to work with large datasets.
## bycrypt middleware ensures that the password is hashed before saving it to the database, but only if the password has been modified during the save operation.
## utils folder is for reusing files and its code anywhere.
## JWT middleware
### JWTs are commonly used for user authentication. After a user logs in, the server generates a JWT and sends it to the client. The client includes the JWT in subsequent requests to access protected resources.
### An Access token is a type of token commonly used in authentication systems.Access tokens are often short-lived and have an expiration time. They are typically sent in the Authorization header of HTTP requests.
### Unlike access tokens, refresh tokens are long-lived and are used to obtain new access tokens without requiring the user to log in again.
### Both access tokens and refresh tokens can be implemented using JWTs.
## MULTER 
### It is a middleware which takes files from client-side to server-side.
