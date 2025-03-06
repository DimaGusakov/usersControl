class User {
  constructor(id, name, email, role) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
  }
  renderRow() {
    const roleRuArr = {
      admin: "Администратор",
      regular: "Обычный пользователь",
      guest: "Гость",
    };

    const roleClass = this.role;
    const displayRole = roleRuArr[this.role] || this.role;
    return `
      <tr data-user-id="${this.id}">
        <td class="${roleClass}-user">${this.id}</td>
        <td>${this.name}</td>
        <td>${this.email}</td>
        <td>${displayRole}</td>
        <td class="action-buttons">
          <button class="edit-btn" data-id="${this.id}">✏️</button>
          <button class="delete-btn" data-id="${this.id}">❌</button>
        </td>
      </tr>
    `;
  }
}

class AdminUser extends User {
  constructor(id, name, email, role, permissions) {
    super(id, name, email, role);
    this.permissions = permissions;
  }

  manageUsers() {
    console.log(`${this.name} is managing users.`);
  }

  deleteUser(userId) {
    console.log(`${this.name} deleted user with ID: ${userId}`);
  }
}

class RegularUser extends User {
  constructor(id, name, email, role) {
    super(id, name, email, role);
  }

  createPost() {
    console.log(`${this.name} created a new post.`);
  }

  commentOnPost(postId) {
    console.log(`${this.name} commented on post with ID: ${postId}`);
  }
}

class GuestUser extends User {
  constructor(id, name, email, role) {
    super(id, name, email, role);
  }

  viewPublicContent() {
    console.log(`${this.name} is viewing public content.`);
  }
}

class UserManager {
  constructor() {

    this.usersTableBody = document.querySelector("#usersTable tbody");
    this.userFormModal = document.querySelector("#userFormModal");
    this.addUserBtn = document.getElementById("addUserBtn");
    this.closeBtn = document.querySelector(".close-button");
    this.userForm = document.getElementById("userForm");
    this.searchInput = document.getElementById("userSearch");
    this.modalTitle = document.querySelector(".modal-title");


    this.users = this.loadUsers() || [
      new AdminUser(1, "Иван", "ivan.admin@example.com", "admin", [
        "create_user",
        "edit_user",
        "delete_user",
        "view_user_list",
      ]),
      new RegularUser(2, "Елена", "elena.regular@example.com", "regular"),
      new GuestUser(3, "Егор", "guest1@example.com", "guest"),
      new RegularUser(4, "Алексей", "alex.regular@example.com", "regular"),
    ];


    this.bindEvents();

    this.render(this.users);
  }

  updateLocalStorage() {
    localStorage.setItem("users", JSON.stringify(this.users));
  }

  loadUsers() {
    const usersData = localStorage.getItem("users");
    if (usersData) {
      try {
        const parsedUsers = JSON.parse(usersData);
        return parsedUsers.map((user) => {
          const UserClass = this.getCorrectUserClass(user.role);
          if (user.role === "admin") {
            return new UserClass(
              user.id,
              user.name,
              user.email,
              user.role,
              user.permissions
            );
          } else {
            return new UserClass(user.id, user.name, user.email, user.role);
          }
        });
      } catch (e) {
        console.error("Ошибка при загрузке пользователей из localStorage:", e);
      }
    }
    return null;
  }

  render(arr) {
    let tableContent = "";
    if (arr.length === 0) {
      tableContent = `
        <tr>
          <td colspan="5" class="no-data">
            ${
              arr === this.users
                ? "Нет пользователей"
                : "Пользователи не найдены"
            }
          </td>
        </tr>
      `;
    } else {
      arr.forEach((user) => (tableContent += user.renderRow()));
    }
    this.usersTableBody.innerHTML = tableContent;
    this.updateLocalStorage();
  }

  deleteUser(userId) {
    this.users = this.users.filter((user) => user.id !== +userId);
    this.render(this.users);
  }

  editUser(userId) {
    const user = this.users.find((user) => user.id === +userId);
    if (!user) return;
    document.querySelector("#userId").value = user.id;
    document.querySelector("#name").value = user.name;
    document.querySelector("#email").value = user.email;
    document.querySelector("#role").value = user.role;
    this.modalTitle.textContent = "Редактировать пользователя";
    this.userFormModal.style.display = "block";
  }

  bindEvents() {
    this.usersTableBody.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        this.deleteUser(e.target.dataset.id);
      }
      if (e.target.classList.contains("edit-btn")) {
        this.editUser(e.target.dataset.id);
      }
    });

    this.addUserBtn.addEventListener("click", () => {
      this.userFormModal.style.display = "block";
      this.userForm.reset();
      document.querySelector("#userId").value = "";
      this.modalTitle.textContent = "Добавить пользователя";
    });

    this.closeBtn.addEventListener("click", () => {
      this.userFormModal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === this.userFormModal)
        this.userFormModal.style.display = "none";
    });

    this.userForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const userId = document.querySelector("#userId").value;
      const name = document.querySelector("#name").value;
      const email = document.querySelector("#email").value;
      const role = document.querySelector("#role").value;

      if (userId) {
        const userIndex = this.users.findIndex((user) => user.id === +userId);
        if (userIndex !== -1) {
          const UserClass = this.getCorrectUserClass(role);
          if (role === "admin") {
            this.users[userIndex] = new UserClass(+userId, name, email, role, [
              "create_user",
              "edit_user",
              "delete_user",
              "view_user_list",
            ]);
          } else {
            this.users[userIndex] = new UserClass(+userId, name, email, role);
          }
        }
      } else {
        const newUserId =
          this.users.length > 0
            ? Math.max(...this.users.map((user) => user.id)) + 1
            : 1;
        const UserClass = this.getCorrectUserClass(role);
        if (role === "admin") {
          this.users.push(
            new UserClass(newUserId, name, email, role, [
              "create_user",
              "edit_user",
              "delete_user",
              "view_user_list",
            ])
          );
        } else {
          this.users.push(new UserClass(newUserId, name, email, role));
        }
      }
      this.render(this.users);
      this.userFormModal.style.display = "none";
    });

    this.searchInput.addEventListener("input", (e) => {
      const value = e.target.value.toLowerCase();
      if (value.length > 2) {
        const filteredUsers = this.users.filter((user) =>
          user.name.toLowerCase().includes(value)
        );
        this.render(filteredUsers);
      } else {
        this.render(this.users);
      }
    });
  }

  getCorrectUserClass(role) {
    switch (role) {
      case "admin":
        return AdminUser;
      case "regular":
        return RegularUser;
      case "guest":
        return GuestUser;
      default:
        return User;
    }
  }
}

const userManager = new UserManager();
