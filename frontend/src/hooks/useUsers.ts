import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inviteUser,
  getUsers,
  getUserById,
  updateUserRole,
  removeUser,
  type InviteUserDto,
} from '../services/userService';
import { UserRole } from '../../../shared/types/enums';

/**
 * Query keys for users
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch all users in organization
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: getUsers,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single user
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to invite a new user
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update a user's role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      updateUserRole(userId, role),
    onSuccess: (updatedUser) => {
      // Invalidate lists and specific user
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(updatedUser.id) });
    },
  });
}

/**
 * Hook to remove a user
 */
export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
