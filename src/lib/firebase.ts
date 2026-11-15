import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfigFromFile from '../../firebase-applet-config.json';

const resolvedConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) || firebaseConfigFromFile.apiKey,
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ||
    firebaseConfigFromFile.authDomain,
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ||
    firebaseConfigFromFile.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) || firebaseConfigFromFile.appId,
  messagingSenderId: firebaseConfigFromFile.messagingSenderId,
};

const app = initializeApp(resolvedConfig);

// Uses default Firestore database "(default)" on standard Spark projects,
// or the provisioned named database when running inside AI Studio.
const databaseId =
  (import.meta.env.VITE_FIREBASE_DATABASE_ID as string | undefined) ||
  firebaseConfigFromFile.firestoreDatabaseId;

export const db =
  databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase App Check if a reCAPTCHA v3 site key is configured
const recaptchaKey =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined) ||
  firebaseConfigFromFile.recaptchaSiteKey;

if (typeof window !== 'undefined' && recaptchaKey && recaptchaKey !== 'MY_RECAPTCHA_V3_SITE_KEY') {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('App Check initialization skipped:', err);
  }
}

export const isAppCheckConfigured = Boolean(
  recaptchaKey && recaptchaKey !== 'MY_RECAPTCHA_V3_SITE_KEY'
);

// Validate connection to Firestore on boot
async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. Firestore client is offline.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testConnection();
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
