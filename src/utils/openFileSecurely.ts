// utils/openFileSecurely.ts
export const openFileSecurely = async (
  type: string, // blog | project | rfi | submittals | rfq
  id: string | number, // blog ID / project ID / etc
  fileId: string | number
) => {
  try {
    const baseURL = import.meta.env.VITE_BASE_URL;
    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("Authentication token missing");
      return;
    }

    // ✅ final correct URL
    const url = `${baseURL}${type}/viewFile/${id}/${fileId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch file");
    }

    const blob = await response.blob();
    const fileURL = window.URL.createObjectURL(blob);

    window.open(fileURL, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("File open failed:", err);
    alert("Unable to open file");
  }
};
