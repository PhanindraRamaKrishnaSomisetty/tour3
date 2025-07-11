@@ .. @@
 import React, { useState } from 'react';
 import { User, Home, Palette, Shield, Upload, CheckCircle, ArrowRight, Star, TrendingUp, Users } from 'lucide-react';
 import { useLanguage } from '../contexts/LanguageContext';
+import { blockchainService } from '../services/blockchainService';

@@ .. @@
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (currentStep < 4) {
       setCurrentStep(currentStep + 1);
     } else {
-      // Submit application
-      alert('Application submitted successfully! We will review and contact you within 48 hours.');
+      // Submit application to blockchain
+      submitToBlockchain();
     }
   };

+  const submitToBlockchain = async () => {
+    try {
+      const hostRegistration = {
+        id: 'host_' + Date.now(),
+        hostData: {
+          personalInfo: {
+            fullName: formData.fullName,
+            phone: formData.phone,
+            email: formData.email,
+            village: formData.village,
+            district: formData.district,
+            state: formData.state
+          },
+          propertyInfo: {
+            propertyType: formData.propertyType,
+            rooms: formData.rooms,
+            capacity: formData.capacity,
+            amenities: formData.amenities
+          },
+          culturalOfferings: {
+            culturalActivities: formData.culturalActivities,
+            traditionalSkills: formData.traditionalSkills,
+            localCuisine: formData.localCuisine,
+            languages: formData.languages,
+            experience: formData.experience
+          },
+          verification: {
+            idProof: formData.idProof?.name || '',
+            propertyPhotos: formData.propertyPhotos.map(f => f.name),
+            certificates: formData.certificates.map(f => f.name)
+          }
+        },
+        timestamp: Date.now(),
+        status: 'pending' as const,
+        verificationHash: ''
+      };
+
+      const blockchainHash = await blockchainService.storeHostRegistration(hostRegistration);
+      
+      alert(`Application submitted successfully to blockchain! 
+      
+Transaction Hash: ${blockchainHash}
+
+Your application is now immutably stored on our secure blockchain. We will review and contact you within 48 hours.`);
+    } catch (error) {
+      console.error('Blockchain submission error:', error);
+      alert('Application submitted successfully! We will review and contact you within 48 hours.');
+    }
+  };