import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, insertUser } from '../../repos/userRepo';
import { decodePassword } from '../../utils/passwordCrypto';
import { loginUser, registerUser } from '../../services/authService';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../repos/userRepo');
jest.mock('../../utils/passwordCrypto');

const mockedHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
const mockedCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
const mockedSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;
const mockedInsertUser = insertUser as jest.MockedFunction<typeof insertUser>;
const mockedFindUserByEmail = findUserByEmail as jest.MockedFunction<typeof findUserByEmail>;
const mockedDecodePassword = decodePassword as jest.MockedFunction<typeof decodePassword>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUser hashes password and inserts user', async () => {
    mockedDecodePassword.mockReturnValue('plainpassword');
    mockedHash.mockImplementation(async () => 'hashed_password');
    mockedInsertUser.mockResolvedValue({
      id: 1,
      email: 'u@example.com',
      name: 'User',
      created_at: new Date(),
    });

    const user = await registerUser({
      email: 'u@example.com',
      name: 'User',
      password: 'encrypted-or-plain',
    });

    expect(mockedHash).toHaveBeenCalledWith('plainpassword', 10);
    expect(mockedInsertUser).toHaveBeenCalled();
    expect(user.email).toBe('u@example.com');
  });

  test('registerUser throws BAD_REQUEST when decoded password length is invalid', async () => {
    mockedDecodePassword.mockReturnValue('short');

    await expect(
      registerUser({
        email: 'u@example.com',
        name: 'User',
        password: 'short',
      }),
    ).rejects.toMatchObject({
      code: 'BAD_REQUEST',
      message: 'Password must be between 8 and 200 characters',
    });
  });

  test('registerUser maps PG unique error to CONFLICT', async () => {
    mockedDecodePassword.mockReturnValue('plainpassword');
    mockedHash.mockImplementation(async () => 'hashed_password');
    mockedInsertUser.mockRejectedValue({ code: '23505' });

    await expect(
      registerUser({
        email: 'dup@example.com',
        name: 'Dup',
        password: 'plainpassword',
      }),
    ).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'Email already exists',
    });
  });

  test('loginUser returns token for valid credentials', async () => {
    mockedFindUserByEmail.mockResolvedValue({
      id: 2,
      email: 'ok@example.com',
      name: 'Ok',
      password_hash: 'hash',
      created_at: new Date(),
    });
    mockedDecodePassword.mockReturnValue('plainpassword');
    mockedCompare.mockImplementation(async () => true);
    mockedSign.mockReturnValue('jwt_token' as never);

    const result = await loginUser({ email: 'ok@example.com', password: 'secret' });
    expect(result).toEqual({ token: 'jwt_token' });
  });

  test('loginUser throws UNAUTHORIZED when user is missing or password mismatch', async () => {
    mockedFindUserByEmail.mockResolvedValueOnce(null);
    await expect(loginUser({ email: 'missing@example.com', password: 'secret' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });

    mockedFindUserByEmail.mockResolvedValueOnce({
      id: 2,
      email: 'ok@example.com',
      name: 'Ok',
      password_hash: 'hash',
      created_at: new Date(),
    });
    mockedDecodePassword.mockReturnValue('plainpassword');
    mockedCompare.mockImplementation(async () => false);
    await expect(loginUser({ email: 'ok@example.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials',
    });
  });
});
