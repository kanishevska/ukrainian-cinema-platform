class User {
    constructor(id, username, email, role = 'Guest') {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role; // 'Guest', 'RegisteredUser', 'Admin'
    }

    getUserInfo() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            role: this.role
        };
    }
}

class RegisteredUser extends User {
    constructor(id, username, email, passwordHash) {
        super(id, username, email, 'RegisteredUser');
        this.passwordHash = passwordHash;
    }
}

class Admin extends RegisteredUser {
    constructor(id, username, email, passwordHash) {
        super(id, username, email, passwordHash);
        this.role = 'Admin';
    }
}

module.exports = { User, RegisteredUser, Admin };