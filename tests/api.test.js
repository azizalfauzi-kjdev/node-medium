const request = require("supertest");
const app = require("../src/app"); // Import instance app Express kamu

describe("RESTful API Integration Testing", () => {
  let superAdminToken;
  let userToken;
  let createdUserId;
  // --------------------------------------------------
  // 1. SKENARIO AUTENTIKASI
  // --------------------------------------------------
  describe("Auth Endpoints (/api/auth)", () => {
    test("1.1 Register Super Admin", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Super Admin Test",
        email: "admin_test@mail.com",
        password: "password123",
        role: "super_admin",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("data");
    });

    test("1.2 Register User Biasa", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "User Test",
        email: "user_test@mail.com",
        password: "password123",
        role: "user",
      });

      expect(res.statusCode).toEqual(201);
    });

    test("1.3 Login Super Admin & Dapatkan Token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "admin_test@mail.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      superAdminToken = res.body.token; // Menyimpan token Super Admin
    });

    test("1.4 Login User Biasa & Dapatkan Token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "user_test@mail.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      userToken = res.body.token; // Menyimpan token User Biasa
    });
  });

  // --------------------------------------------------
  // 2. SKENARIO HAK AKSES SUPER ADMIN
  // --------------------------------------------------
  describe("User Endpoints - Super Admin Access", () => {
    test("2.1 GET All Users (Super Admin)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("2.2 CREATE User Baru (Super Admin)", async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          name: "Target User",
          email: "target@mail.com",
          password: "password123",
          role: "user",
        });

      expect(res.statusCode).toEqual(201);
      createdUserId = res.body.data.id; // Simpan ID untuk pengujian PUT & DELETE
    });

    test("2.3 UPDATE User Data (Super Admin)", async () => {
      const res = await request(app)
        .put(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${superAdminToken}`)
        .send({
          name: "Target User Updated",
          email: "target_updated@mail.com",
        });

      expect(res.statusCode).toEqual(200);
    });

    test("2.4 DELETE User Data (Super Admin)", async () => {
      const res = await request(app)
        .delete(`/api/users/${createdUserId}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.statusCode).toEqual(200);
    });
  });

  // --------------------------------------------------
  // 3. SKENARIO HAK AKSES USER BIASA
  // --------------------------------------------------
  describe("User Endpoints - Regular User Restrictions", () => {
    test("3.1 GET All Users (User Biasa - Ditolak)", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${userToken}`);

      // Ekspektasi 403 Forbidden karena GET ALL khusus Super Admin
      expect(res.statusCode).toEqual(403);
    });

    test("3.2 GET User By ID (User Biasa - Diizinkan untuk ID Sendiri)", async () => {
      // Catatan: Pastikan ID sesuai dengan ID user yang sedang login (misal: ID 2)
      const res = await request(app)
        .get("/api/users/2")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("data");
    });

    test('3.3 CREATE User Baru (User Biasa - Role Dipaksa Jadi "user")', async () => {
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "User Coba Hack Role",
          email: "hackrole@mail.com",
          password: "password123",
          role: "super_admin", // Mencoba kirim super_admin
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data.role).toEqual("user"); // Harus tetap diset 'user'
    });

    test("3.4 PUT Update User (User Biasa - Ditolak)", async () => {
      const res = await request(app)
        .put("/api/users/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ name: "Malicious Update" });

      expect(res.statusCode).toEqual(403); // Forbidden
    });

    test("3.5 DELETE User (User Biasa - Ditolak)", async () => {
      const res = await request(app)
        .delete("/api/users/1")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403); // Forbidden
    });
  });
});
