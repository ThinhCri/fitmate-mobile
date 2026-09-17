/**
 * FriendButton — FP-025 friend UI state machine.
 * States: Self | Friend | Sent | NotFriend.
 *
 * Behavior:
 * - Self: render "Sửa hồ sơ" thay vì friend action.
 * - Friend: "Bạn bè" + nút nhỏ "Hủy kết bạn".
 * - Sent: "Đã gửi lời mời" + nút nhỏ "Hủy yêu cầu".
 * - NotFriend: "Kết bạn" -> send request (cross-user).
 *
 * Cross-user sync qua mockUserService.updateOtherUser.
 */
import { useState } from 'react';
import { UserPlus, UserCheck, Clock, X, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/services/AuthContext';
import { mockUserService } from '@/services/mockUserService';
import { ToastService } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export type FriendState = 'self' | 'friend' | 'sent' | 'not_friend';

export interface FriendButtonProps {
  targetEmail: string;
  isSelf?: boolean;
  onEditSelf?: () => void;
}

function determineState(
  isSelf: boolean,
  isFriend: boolean,
  isSentByMe: boolean,
): FriendState {
  if (isSelf) return 'self';
  if (isFriend) return 'friend';
  if (isSentByMe) return 'sent';
  return 'not_friend';
}

export function FriendButton({ targetEmail, isSelf, onEditSelf }: FriendButtonProps) {
  const { user, refresh } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const state = determineState(
    isSelf ?? user.email === targetEmail,
    user.friendsList.includes(targetEmail),
    user.sentRequests.includes(targetEmail),
  );

  const sendRequest = async () => {
    setBusy(true);
    try {
      const updatedViewer = { ...user, sentRequests: [...user.sentRequests, targetEmail] };
      await mockUserService.saveUser(updatedViewer);
      // Cross-user: add to target's friendRequests
      await mockUserService.updateOtherUser(targetEmail, (u) => ({
        ...u,
        friendRequests: [
          ...u.friendRequests,
          {
            id: `fr-${Date.now()}`,
            fromEmail: user.email,
            toEmail: targetEmail,
            timestamp: new Date().toISOString(),
            status: 'pending',
          },
        ],
        notifications: [
          ...u.notifications,
          {
            id: `notif-${Date.now()}`,
            type: 'friend_request',
            message: `${user.profile.name} đã gửi lời mời kết bạn`,
            timestamp: new Date().toISOString(),
            read: false,
            fromEmail: user.email,
          },
        ],
      }));
      await refresh();
      ToastService.show({ message: 'Đã gửi lời mời kết bạn!', tone: 'success' });
    } finally {
      setBusy(false);
    }
  };

  const cancelRequest = async () => {
    setBusy(true);
    try {
      await mockUserService.saveUser({
        ...user,
        sentRequests: user.sentRequests.filter((e) => e !== targetEmail),
      });
      await mockUserService.updateOtherUser(targetEmail, (u) => ({
        ...u,
        friendRequests: u.friendRequests.filter((fr) => !(fr.fromEmail === user.email && fr.toEmail === targetEmail && fr.status === 'pending')),
      }));
      await refresh();
      ToastService.show({ message: 'Đã hủy lời mời.', tone: 'info' });
    } finally {
      setBusy(false);
    }
  };

  const unfriend = async () => {
    setBusy(true);
    try {
      await mockUserService.saveUser({
        ...user,
        friendsList: user.friendsList.filter((e) => e !== targetEmail),
      });
      await mockUserService.updateOtherUser(targetEmail, (u) => ({
        ...u,
        friendsList: u.friendsList.filter((e) => e !== user.email),
      }));
      await refresh();
      ToastService.show({ message: 'Đã hủy kết bạn.', tone: 'info' });
    } finally {
      setBusy(false);
    }
  };

  if (state === 'self') {
    return (
      <Button
        label="Sửa hồ sơ"
        variant="primary"
        onPress={onEditSelf}
        iconLeft={<Edit3 size={14} color="#FFFFFF" />}
      />
    );
  }

  if (state === 'friend') {
    return (
      <Button
        label="Bạn bè"
        variant="secondary"
        onPress={unfriend}
        disabled={busy}
        iconLeft={<UserCheck size={14} color="#FFFFFF" />}
      />
    );
  }

  if (state === 'sent') {
    return (
      <Button
        label="Đã gửi lời mời"
        variant="ghost"
        onPress={cancelRequest}
        disabled={busy}
        iconLeft={<Clock size={14} color="#1A1A1F" />}
      />
    );
  }

  // not_friend
  return (
    <Button
      label="Kết bạn"
      variant="primary"
      onPress={sendRequest}
      disabled={busy}
      iconLeft={<UserPlus size={14} color="#FFFFFF" />}
    />
  );
}

export default FriendButton;
