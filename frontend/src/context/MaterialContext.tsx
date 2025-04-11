import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import {
  getMaterials,
  uploadMaterial,
  deleteMaterial,
  downloadMaterial,
} from "@/services/materialApi";

interface Material {
  id: string;
  title: string;
  description?: string;
  type: "file" | "link";
  url?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  classroomId: string;
  userId: string;
  createdAt: string;
}

interface MaterialContextType {
  materials: Material[];
  loading: boolean;
  error: string | null;
  fetchMaterials: (classroomId: string) => Promise<void>;
  addMaterial: (materialData: FormData) => Promise<Material>;
  removeMaterial: (materialId: string) => Promise<void>;
  downloadMaterial: (materialId: string) => Promise<Blob>;
}

const MaterialContext = createContext<MaterialContextType | undefined>(
  undefined
);

export const MaterialProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    materials: Material[];
    loading: boolean;
    error: string | null;
  }>({
    materials: [],
    loading: false,
    error: null,
  });

  const handleError = (err: unknown) => {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    setState((prev) => ({ ...prev, error: message }));
    throw new Error(message);
  };

  const fetchMaterials = useCallback(async (classroomId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const data = await getMaterials(classroomId);
      setState((prev) => ({ ...prev, materials: data }));
    } catch (err) {
      handleError(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const addMaterial = useCallback(async (materialData: FormData) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const newMaterial = await uploadMaterial(materialData);
      setState((prev) => ({
        ...prev,
        materials: [newMaterial, ...prev.materials],
      }));
      return newMaterial;
    } catch (err) {
      handleError(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const removeMaterial = useCallback(async (materialId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      await deleteMaterial(materialId);
      setState((prev) => ({
        ...prev,
        materials: prev.materials.filter((m) => m.id !== materialId),
      }));
    } catch (err) {
      handleError(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const handleDownload = useCallback(async (materialId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      return await downloadMaterial(materialId);
    } catch (err) {
      handleError(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  return (
    <MaterialContext.Provider
      value={{
        materials: state.materials,
        loading: state.loading,
        error: state.error,
        fetchMaterials,
        addMaterial,
        removeMaterial,
        downloadMaterial: handleDownload,
      }}
    >
      {children}
    </MaterialContext.Provider>
  );
};

export const useMaterials = () => {
  const context = useContext(MaterialContext);
  if (!context) {
    throw new Error("useMaterials must be used within a MaterialProvider");
  }
  return context;
};
