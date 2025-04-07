
const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

// utility class to manage keys in local storage
export class LocalStorage {

  // get key from local storage
  static get(key) {
    if (!isBrowser) return null
    const value = localStorage.getItem(key)
    if (value) {
        try {
            return JSON.parse(value)
        } catch (error) {
            return null
        }
    } return null 
  }

  // set a key with value in local storage
  static set(key, value) {
    if (!isBrowser) return
    localStorage.setItem(key, JSON.stringify(value))
  }

  // remove a value from local storage by key 
  static remove(key) {
    if (!isBrowser) return;
    localStorage.removeItem(key)
  }

  // clear all items from local storage
  static clear() {
    if (!isBrowser) return
    localStorage.clear();
  }
}


// Utility function to handle API request with loading, success and error handling
export const requestHandler = async (api, setLoading, onSuccess, onError) => {
  setLoading && setLoading(true)
  try {
    // Make the API request
    const response = await api();
    const { data } = response;
    if (data.success) {
      // Call the onSuccess function with response data
      onSuccess(data)
    }
  } catch (error) {
    // Handle error cases, including unauthorized and forbidden cases
    console.log("This is error",error)
      localStorage.clear()
      onError(error.message || "Something went wrong");
  } finally {
    if (setLoading) setLoading(false)
  }
}