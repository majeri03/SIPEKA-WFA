import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { api } from './api';

export async function loginOrRegister(email: string, password: string) {
  try {
    // 1. Cek apakah user ada di spreadsheet (Database Utama)
    console.log('🔍 Checking user in spreadsheet...');
    const checkResult = await api.checkUserExists(email);
    
    if (!checkResult.exists) {
      throw new Error('Email tidak terdaftar dalam sistem. Hubungi SDM.');
    }
    
    console.log('✅ User exists in spreadsheet');

    // 2. Coba LOGIN terlebih dahulu
    try {
      console.log('🔐 Attempting login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login berhasil');
      return {
        ...userCredential,
        needPasswordChange: false
      };
      
    } catch (loginError: unknown) {
      const authError = loginError as AuthError;
      console.log('⚠️ Login failed code:', authError.code);

      // 3. Jika login gagal, kita cek apakah perlu Register (User Baru)
      // Note: 'auth/invalid-credential' bisa berarti password salah ATAU user belum ada.
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        
        console.log('⚠️ Mencoba auto-register (jika user belum ada)...');

        try {
            // Coba buat akun baru
            const registerData = await api.registerUserToFirebase(email);

            // Validasi Password Awal (Harus sama dengan NIP/Default dari Sheet)
            if (password !== registerData.password) {
                // Jika password input BEDA dengan NIP, dan login gagal,
                // berarti ini User Lama yang salah ketik password.
                throw new Error('Password salah.');
            }

            // Jika password SAMA dengan NIP, coba create user
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              email, 
              registerData.password
            );
            
            // Update nama profile
            if (userCredential.user) {
              await updateProfile(userCredential.user, {
                displayName: registerData.name
              });
            }
            
            console.log('✅ Auto-register berhasil!');
            return {
              ...userCredential,
              needPasswordChange: true // Flag ganti password
            };

        } catch (regError: unknown) {
            const regAuthError = regError as AuthError;
            
            // 4. Handle jika ternyata Email SUDAH ADA saat coba register
            if (regAuthError.code === 'auth/email-already-in-use') {
                console.log('❌ User sudah ada, berarti password salah.');
                throw new Error('Password salah.');
            }

            // Error lain saat register
            throw regError;
        }
      } 
      
      // Jika error login bukan masalah credential (misal network error)
      throw authError;
    }
    
  } catch (error) {
    console.error('❌ Login Process Error:', error);
    throw error;
  }
}