// REVENUECAT DISABLED FOR PRODUCTION BUILD
// Stub functions that return default values
/*
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  return false; // No premium without RevenueCat
};

export const getOfferings = async () => {
  return null;
};

export const purchasePackage = async (_packageToPurchase: unknown) => {
  return false;
};

export const restorePurchases = async (): Promise<boolean> => {
  return false;
};
import Purchases from "react-native-purchases";

const ENTITLEMENT_ID = "Pockit Premium";

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    // Check if user has any active entitlements
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error("Error getting offerings:", error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: any) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error("Error purchasing package:", error);
    }
    return false;
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error("Error restoring purchases:", error);
    return false;
  }
};
*/
