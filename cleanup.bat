@echo off
echo Blog App Cleanup - Remove Backend Files
echo =======================================
echo.
echo This script will remove backend-related files that are no longer needed
echo since the application has been converted to a frontend-only version.
echo.
echo Files to be deleted:
echo  - server.js (Express server)
echo  - init-db.js (Database initialization)
echo  - test-api.js (API testing)
echo  - update-password.js (Password utility)
echo  - schema.sql (Database schema)
echo  - add_likes_table.sql (Database tables)
echo  - create_likes_table.js (Database script)
echo  - .env (Environment variables)
echo  - render.yaml (Deployment configuration)
echo.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

echo.
echo Deleting backend files...
echo.

del /f server.js
echo Removed: server.js
del /f init-db.js
echo Removed: init-db.js
del /f test-api.js
echo Removed: test-api.js
del /f update-password.js
echo Removed: update-password.js
del /f schema.sql
echo Removed: schema.sql
del /f add_likes_table.sql
echo Removed: add_likes_table.sql
del /f create_likes_table.js
echo Removed: create_likes_table.js
del /f .env
echo Removed: .env
del /f render.yaml
echo Removed: render.yaml

echo.
echo Backend files have been removed.
echo.
echo You may also want to update package.json to remove backend dependencies.
echo To do this, edit package.json and remove references to:
echo  - bcryptjs
echo  - cors
echo  - dotenv
echo  - express
echo  - jsonwebtoken
echo  - multer
echo  - mysql2
echo.
echo Cleanup complete!
echo.
pause 