import { auth } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  AuthError // ✅ Ganti dengan AuthError
} from 'firebase/auth';
import { api } from './api';

export async function loginOrRegister(email: string, password: string) {
  try {
    // 1. Cek apakah user ada di spreadsheet
    console.log('🔍 Checking user in spreadsheet...');
    const checkResult = await api.checkUserExists(email);
    
    if (!checkResult.exists) {
      throw new Error('Email tidak terdaftar dalam sistem. Hubungi SDM.');
    }
    
    console.log('✅ User exists in spreadsheet');

    // 2. Coba login dulu
    try {
      console.log('🔐 Attempting login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login berhasil (existing user)');
      return {
        ...userCredential,
        needPasswordChange: false
      };
      
    } catch (loginError: unknown) {
      // ✅ Type guard untuk AuthError
      if (loginError && typeof loginError === 'object' && 'code' in loginError) {
        const authError = loginError as AuthError;
        console.log('⚠️ Login error code:', authError.code);
        
        // 3. Kalau login gagal karena user belum ada di Firebase
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
          console.log('⚠️ User belum ada di Firebase, auto-register...');
          
          // 4. Auto-register ke Firebase
          const registerData = await api.registerUserToFirebase(email);
          
          console.log('🔑 Password from input:', password);
          console.log('🔑 Expected password (NIP):', registerData.password);
          console.log('🔑 Match?', password === registerData.password);
          
          // Cek apakah password yang diinput = NIP (password default)
          if (password === registerData.password) {
            console.log('✅ Password match! Registering to Firebase...');
            
            // Register dengan NIP sebagai password
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              email, 
              registerData.password
            );
            
            // Update display name
            if (userCredential.user) {
              await updateProfile(userCredential.user, {
                displayName: registerData.name
              });
            }
            
            console.log('✅ Auto-register berhasil!');
            
            return {
              ...userCredential,
              needPasswordChange: true // Flag untuk wajib ganti password
            };
            
          } else {
            throw new Error('Untuk login pertama kali, gunakan NIP sebagai password.');
          }
          
        } else {
          // Error lain (wrong password, dll)
          throw authError;
        }
      } else {
        // Bukan AuthError
        throw new Error('Login error: ' + String(loginError));
      }
    }
    
  } catch (error) {
    console.error('❌ loginOrRegister error:', error);
    throw error;
  }
}