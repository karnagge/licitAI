import api from './api';
import { UserRole } from '@shared/types/enums';

/**
 * User API Service
 * Handles all user/team management API calls
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  emailVerified: boolean;
  lastLoginAt?: Date;
}

export interface InviteUserDto {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

/**
 * Invite a new user to the organization
 */
export async function inviteUser(data: InviteUserDto): Promise<User & { tempPassword?: string }> {
  const response = await api.post<User & { tempPassword?: string }>('/users/invite', data);
  return response.data;
}

/**
 * Get all users in the organization
 */
export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, role: UserRole): Promise<User> {
  const response = await api.patch<User>(`/users/${userId}/role`, { role });
  return response.data;
}

/**
 * Remove a user from the organization
 */
export async function removeUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

export const userService = {
  inviteUser,
  getUsers,
  getUserById,
  updateUserRole,
  removeUser,
};

export default userService;
