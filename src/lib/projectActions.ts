import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { getFirebaseFirestore } from './firebase';
import { Project } from '@/types';

export async function saveProject(userId: string, project: Omit<Project, 'updatedAt'>) {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore not initialized');

    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    await setDoc(projectRef, {
        ...project,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

export async function getProjects(userId: string): Promise<Project[]> {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore not initialized');

    const projectsRef = collection(db, 'users', userId, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            updatedAt: (data.updatedAt as Timestamp)?.toMillis() || Date.now(),
        } as Project;
    });
}

export async function deleteProject(userId: string, projectId: string) {
    const db = getFirebaseFirestore();
    if (!db) throw new Error('Firestore not initialized');

    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
}
