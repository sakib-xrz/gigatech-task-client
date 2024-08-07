# APPOINTEASE

Live Website: [https://appointease-client.onrender.com](https://appointease-client.onrender.com)

### Overview

APPOINTEASE is a comprehensive appointment scheduling application developed using Next.js, designed to simplify the process of managing appointments. This application caters to users who need to schedule, manage, and organize their appointments efficiently.

### Features

**1. User Registration and Login:**

- Secure user registration and login functionality.
- Authentication using username and password.

**2. User Interaction:**

- View and search functionality to find other users.
- Ability to schedule appointments with a specific user.

**3. Appointment Management:**

- Ability to schedule appointments with any users.
- Search and filter options to manage appointments.
- Differentiation between upcoming and past appointments.
- Capability to cancel appointments before the scheduled time.
- Capability to reschedule appointments.
- Options for appointment holders to accept or decline appointments.
- Inclusion of recorded audio messages with appointments for added context.

### Technical Specifications:

- **Next.js** (as a frontend framework)
- **Ant Design** (as a component library)
- **Zustand** (for state management)
- **React Query** (for better caching and revalidation)
- **Axios** (for handling HTTP requests)
- **Formik** (for form handling)
- **Yup** (for form validation)
- **Tailwind CSS** (as a CSS framework)

### Additional Features:

- **Docker**: The frontend application is containerized using Docker.
- **GitHub Actions**: Continuous integration and deployment using GitHub Actions with the following workflow:

```
name: Build and Push Docker image to Docker Hub

on: push
jobs:
  push_to_registry:
    name: Push Docker image to Docker Hub
    runs-on: ubuntu-latest
    steps:
      - name: Check out the repo
        uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/appointease-client:latest
```

### Backend:

- The backend server is built using **Express** and **Mongoose**.
- Backend repository: [GitHub Link](https://github.com/sakib-xrz/gigatech-task-server)
- Backend hosted link: [https://appointease-server.vercel.app/](https://appointease-server.vercel.app/)
- Postman collection: <a href="https://github.com/sakib-xrz/gigatech-task-client/blob/main/gigatech-task.postman_collection.json" download>Click here to download</a>
