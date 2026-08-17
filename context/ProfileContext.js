import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext(null);

// Populated once from Create Profile, readable anywhere downstream
// (Home, Risk Screening, etc.) without threading it through every
// navigation.navigate() call.
export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  // profile: {
  //   name, dob, pregnancyWeek, edd,
  //   isFirstPregnancy: boolean | null,
  //   previousDeliveryType: 'Vaginal' | 'C-section' | 'Both' | null,
  //   previousObstructedLabour: 'Yes' | 'No' | 'Unsure' | null,
  //   otherHistoryNotes: string,
  // }

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
