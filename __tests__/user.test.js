const { db, User, Org } = require('../server/db');

beforeAll(async () => {
  await db.sync({ force: true });
});

afterAll(async () => {
  await db.close();
});

describe('User Model Test', () => {
  it('should create a user with join_request_status as none by default', async () => {
    const newUser = await User.create({
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      hashed_password: 'hashedPassword123!',
      role_title: 'Member',
      phone: '1234567890'
    });

    expect(newUser).toBeDefined();
    expect(newUser.join_request_status).toBe('none');
  });

  it('should not allow duplicate usernames', async () => {
    expect.assertions(1);
    try {
      await User.create({
        name: 'Dup User',
        username: 'testuser', // same as above
        email: 'dup@example.com',
        hashed_password: 'hashedPassword123!',
        role_title: 'Member',
        phone: '0987654321'
      });
    } catch (err) {
      expect(err.name).toBe('SequelizeUniqueConstraintError');
    }
  });
});
