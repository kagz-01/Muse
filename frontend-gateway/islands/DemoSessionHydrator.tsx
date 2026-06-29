import { useEffect } from "preact/hooks";
import { userSignal } from "../signals/user.ts";
import { DEMO_USER } from "../utils/demo_data.ts";

export default function DemoSessionHydrator() {
  useEffect(() => {
    const hydrateDemoSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;

        const session = await response.json() as {
          id: string;
          email?: string;
          username?: string;
          name?: string;
          isDemo: boolean;
        };

        if (!session.isDemo) return;

        userSignal.value = {
          ...userSignal.value,
          ...DEMO_USER,
          id: session.id,
          email: session.email ?? DEMO_USER.email,
          username: session.username ?? DEMO_USER.username,
          name: session.name ?? DEMO_USER.name,
        };
      } catch {
        // Ignore failed session hydration.
      }
    };

    hydrateDemoSession();
  }, []);

  return null;
}
