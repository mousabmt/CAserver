const { Org } = require('../server/db');

describe('Organization Model Test', () => {
  it('should create a public organization by default', async () => {
    const org = await Org.create({
      name: 'Open Org',
      email: 'open@org.com',
      hashed_password: 'hashedPassword123!',
      phone: '111222333'
    });

    expect(org).toBeDefined();
    expect(org.is_private).toBe(false);
  });
});
