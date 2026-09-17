/**
 * RewardSimulation — auto-bump knowledge post reactions every 4s.
 * FP-010: Web App.jsx lines 1018-1070.
 *
 * Logic:
 *   - Moi 4s tick: random reaction (heart/flame/smile) tu random system user
 *     len post knowledge cua current user.
 *   - Total reactions >= 50 → isQuality = true, +10 rewardPoints, toast.
 *   - Sau do moi 5 reactions tiep theo → +1 rewardPoint.
 *   - Cap total reactions = 75 de khong "viral qua nhieu".
 *   - Show toast "Day la simulation, khong phai diem that" khi user dang
 *     dang o man hinh SocialScreen.
 *
 * Provider mount o root layout, hook vao AuthContext de biet current user.
 */

import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { bumpRandomKnowledgeReaction, getAllPostsSync, toggleReaction } from './postsStore';
import { mockUserService } from './mockUserService';
import { ToastService } from '@/components/ui/Toast';

const TICK_INTERVAL_MS = 4000;

export function RewardSimulationProvider({ children }: { children: React.ReactNode }) {
  const { user, refresh } = useAuth();
  const knownQualityPostsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const appStateListener = AppState.addEventListener('change', () => {
      // No-op for now; interval continues in background but React Native pauses timers.
    });

    const interval = setInterval(async () => {
      // Find current user's knowledge posts (posts owned by current user).
      const all = getAllPostsSync();
      const myKnowledge = all.filter((p) => p.authorEmail === user.email && p.isKnowledge);
      if (myKnowledge.length === 0) return;

      // Pick the post with lowest reaction count
      const target = myKnowledge.sort((a, b) => a.reactions.length - b.reactions.length)[0];
      if (target.reactions.length >= 75) return; // cap

      // Bump a random reaction
      const types: Array<'heart' | 'flame' | 'smile'> = ['heart', 'flame', 'smile'];
      const fakeUsers = ['minh@fitmate.vn', 'lananh@fitmate.vn', 'phuong@fitmate.vn', 'khanh@fitmate.vn'];
      const type = types[Math.floor(Math.random() * types.length)];
      const fromEmail = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
      if (target.reactions.find((r) => r.userEmail === fromEmail && r.type === type)) return;

      await toggleReaction(target.id, fromEmail, type);

      // Re-read after toggle
      const after = (await bumpRandomKnowledgeReaction()) ?? getAllPostsSync().find((p) => p.id === target.id);
      if (!after) return;

      const total = after.reactions.length;
      let rewardDelta = 0;
      let message = '';

      if (total >= 50 && !knownQualityPostsRef.current.has(target.id)) {
        knownQualityPostsRef.current.add(target.id);
        rewardDelta = 10;
        message = 'Bài viết đạt chất lượng! +10 điểm (simulation).';
      } else if (total > 50 && (total - 50) % 5 === 0) {
        rewardDelta = 1;
        message = '+1 điểm thưởng (simulation, mỗi 5 reactions).';
      }

      if (rewardDelta > 0) {
        await mockUserService.updateCurrentUser({ rewardPoints: user.rewardPoints + rewardDelta });
        await refresh();
        ToastService.show({ message, tone: 'achievement' });
      }
    }, TICK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      appStateListener.remove();
    };
  }, [user, refresh]);

  return <>{children}</>;
}
