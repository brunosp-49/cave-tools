import { Q } from "@nozbe/watermelondb";
import {
  CavityRegisterData,
  ProjectModel,
  ProjectPayload,
  UserModel,
} from "../../types";
import { encrypt } from "../../types/crypt";
import { database } from "../index";
import CavityRegister from "../model/cavityRegister";
import { api } from "../../api";
import store from "../../redux/store";
import { showError } from "../../redux/loadingSlice";
import Project from "../model/project";

// POST
export const createCavityRegister = async (
  cavityData: CavityRegisterData
): Promise<boolean> => {
  try {
    console.log({ date: cavityData.data });
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");

    await database.write(async () => {
      await cavityCollection.create((cavity) => {
        cavity._raw.id = cavityData.registro_id;
        cavity.registro_id = cavityData.registro_id;
        cavity.projeto_id = cavityData.projeto_id;
        cavity.responsavel = cavityData.responsavel;
        cavity.nome_cavidade = cavityData.nome_cavidade;
        cavity.nome_sistema = cavityData.nome_sistema;
        cavity.data = cavityData.data;
        cavity.municipio = cavityData.municipio;
        cavity.uf = cavityData.uf;
        cavity.localidade = cavityData.localidade || undefined;
        cavity.entradas = cavityData.entradas;
        cavity.desenvolvimento_linear =
          cavityData.desenvolvimento_linear || undefined;
        cavity.dificuldades_externas = cavityData.dificuldades_externas;
        cavity.aspectos_socioambientais = cavityData.aspectos_socioambientais;
        cavity.caracterizacao_interna = cavityData.caracterizacao_interna;
        cavity.topografia = cavityData.topografia;
        cavity.morfologia = cavityData.morfologia;
        cavity.hidrologia = cavityData.hidrologia;
        cavity.sedimentos = cavityData.sedimentos;
        cavity.espeleotemas = cavityData.espeleotemas;
        cavity.biota = cavityData.biota;
        cavity.arqueologia = cavityData.arqueologia;
        cavity.paleontologia = cavityData.paleontologia;
        cavity.uploaded = false;
      });
    });

    console.log("Cavity register created successfully!");

    return true;
  } catch (error) {
    console.error("Error creating cavity register:", error);
    throw new Error("Error creating cavity register");
  }
};

export const createUser = async (userData: UserModel): Promise<void> => {
  try {
    const userCollection = database.collections.get("user");

    await database.write(async () => {
      await userCollection.create((user: any) => {
        user._raw.id = userData.user_id;
        user.token = userData.token;
        user.refresh_token = userData.refresh_token;
        user.last_login_date = String(new Date());
      });
    });

    console.log("User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

export const createProjects = async (
  projects: ProjectPayload[]
): Promise<void> => {
  try {
    const projectCollection = database.collections.get<Project>("project");

    await database.write(async () => {
      for (const projectData of projects) {
        await projectCollection.create((project) => {
          project._raw.id = String(projectData.id);
          project.fk_cliente = projectData.fk_cliente;
          project.nome_projeto = projectData.nome_projeto;
          project.inicio = projectData.inicio;
          project.descricao_projeto = projectData.descricao_projeto;
          project.uploaded = false;
        });
      }
    });

    console.log("Projects created successfully!");
  } catch (error) {
    console.error("Error creating projects:", error);
  }
};

// GET
export const fetchAllCavities = async (): Promise<CavityRegisterData[]> => {
  try {
    const cavityCollection = database.collections.get("cavity_register");
    const cavities = await cavityCollection.query().fetch();

    return cavities.map((cavity: any) => ({
      ...cavity._raw,
      entradas: JSON.parse(cavity.entradas),
      dificuldades_externas: JSON.parse(cavity.dificuldades_externas),
      aspectos_socioambientais: JSON.parse(cavity.aspectos_socioambientais),
      caracterizacao_interna: JSON.parse(cavity.caracterizacao_interna),
      topografia: JSON.parse(cavity.topografia),
      morfologia: JSON.parse(cavity.morfologia),
      hidrologia: JSON.parse(cavity.hidrologia),
      sedimentos: JSON.parse(cavity.sedimentos),
      espeleotemas: JSON.parse(cavity.espeleotemas),
      biota: JSON.parse(cavity.biota),
      arqueologia: JSON.parse(cavity.arqueologia),
      paleontologia: JSON.parse(cavity.paleontologia),
      uploaded: cavity.uploaded,
    }));
  } catch (error) {
    console.error("Error fetching cavities:", error);
    return [];
  }
};

export const fetchPendingCavityCount = async (): Promise<number> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    const count = await cavityCollection
      .query(Q.where("uploaded", false))
      .fetchCount();
    return count;
  } catch (error) {
    console.error("Error fetching pending cavity count:", error);
    return 0;
  }
};

export const fetchAllUsers = async (): Promise<UserModel[]> => {
  try {
    const userCollection = database.collections.get("user");
    const users = await userCollection.query().fetch();

    return users.map((user: any) => user._raw);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchAllProjects = async (): Promise<ProjectModel[]> => {
  try {
    const projectCollection = database.collections.get<Project>("project");
    const projects = await projectCollection.query().fetch();

    return projects.map((project: any) => ({
      _id: Number(project._raw.id),
      fk_cliente: project.fk_cliente,
      nome_projeto: project.nome_projeto,
      inicio: project.inicio,
      descricao_projeto: project.descricao_projeto,

    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// UPDATE

export const syncPendingCavities = async (): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> => {
  console.log("Starting cavity sync process...");
  const cavityCollection =
    database.collections.get<CavityRegister>("cavity_register");
  let cavitiesToSync: CavityRegister[] = [];

  try {
    cavitiesToSync = await cavityCollection
      .query(Q.where("uploaded", false))
      .fetch();

    if (cavitiesToSync.length === 0) {
      console.log("No pending cavities to sync.");
      return { success: true, syncedCount: 0 };
    }

    console.log(`Found ${cavitiesToSync.length} cavities to sync.`);

    const payload: CavityRegisterData[] = cavitiesToSync.map((cavity) => ({
      registro_id: cavity.registro_id,
      projeto_id: cavity.projeto_id,
      responsavel: cavity.responsavel,
      nome_cavidade: cavity.nome_cavidade,
      nome_sistema: cavity.nome_sistema,
      data: cavity.data,
      municipio: cavity.municipio,
      uf: cavity.uf,
      localidade: cavity.localidade,
      entradas: JSON.parse(cavity.entradas || "[]"),
      desenvolvimento_linear: cavity.desenvolvimento_linear,
      dificuldades_externas: JSON.parse(cavity.dificuldades_externas || "null"),
      aspectos_socioambientais: JSON.parse(
        cavity.aspectos_socioambientais || "null"
      ),
      caracterizacao_interna: JSON.parse(
        cavity.caracterizacao_interna || "null"
      ),
      topografia: JSON.parse(cavity.topografia || "null"),
      morfologia: JSON.parse(cavity.morfologia || "null"),
      hidrologia: JSON.parse(cavity.hidrologia || "null"),
      sedimentos: JSON.parse(cavity.sedimentos || "null"),
      espeleotemas: JSON.parse(cavity.espeleotemas || "null"),
      biota: JSON.parse(cavity.biota || "null"),
      arqueologia: JSON.parse(cavity.arqueologia || "null"),
      paleontologia: JSON.parse(cavity.paleontologia || "null"),
    }));
    console.log({ payload });
    // const response = await api.post('/cavidades/', payload);

    // console.log("API sync successful. Response data:", response.data);

    await database.write(async () => {
      for (const cavity of cavitiesToSync) {
        await cavity.update((rec) => {
          rec.uploaded = true;
        });
      }
    });

    console.log(
      `${cavitiesToSync.length} cavities marked as uploaded locally.`
    );
    return { success: true, syncedCount: cavitiesToSync.length };
  } catch (error: any) {
    store.dispatch(
      showError({
        title: "Erro ao enviar cavidades",
        message: "verifique sua conexão com a internet e tente novamente",
      })
    );
    console.error("Error during cavity sync process:", error);
    return {
      success: false,
      syncedCount: 0,
      error: error.message || "Unknown error during sync",
    };
  }
};

export const updateCavity = async (
  registro_id: string,
  updatedData: Partial<CavityRegisterData>
): Promise<void> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    const cavity = await cavityCollection.find(registro_id);

    await database.write(async () => {
      await cavity.update((cav) => {
        cav.responsavel = updatedData.responsavel || cav.responsavel;
        cav.nome_cavidade = updatedData.nome_cavidade || cav.nome_cavidade;
        cav.data = updatedData.data || cav.data;
        cav.entradas = updatedData.entradas
          ? JSON.stringify(updatedData.entradas)
          : cav.entradas;
      });
    });

    console.log("Cavity updated successfully!");
  } catch (error) {
    console.error("Error updating cavity:", error);
  }
};

export const updateUser = async (
  user_id: string,
  updatedData: Partial<UserModel>
): Promise<void> => {
  try {
    const userCollection = database.collections.get("user");
    const user = await userCollection.find(user_id);

    await database.write(async () => {
      await user.update((usr: any) => {
        usr.token = updatedData.token || usr.token;
        usr.refresh_token = updatedData.refresh_token || usr.refresh_token;
        usr.last_login_date =
          updatedData.last_login_date || usr.last_login_date;
      });
    });

    console.log("User updated successfully!");
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// DELETE

export const deleteCavity = async (registro_id: string): Promise<void> => {
  try {
    const cavityCollection = database.collections.get("cavity_register");
    const cavity = await cavityCollection.find(registro_id);

    await database.write(async () => {
      await cavity.markAsDeleted();
      await cavity.destroyPermanently();
    });

    console.log("Cavity deleted successfully!");
  } catch (error) {
    console.error("Error deleting cavity:", error);
  }
};

export const deleteAllCavities = async (): Promise<void> => {
  try {
    const cavityCollection = database.collections.get("cavity_register");
    const allCavities = await cavityCollection.query().fetch();

    await database.write(async () => {
      for (const cavity of allCavities) {
        await cavity.markAsDeleted();
        await cavity.destroyPermanently();
      }
    });

    console.log("All cavities deleted successfully!");
  } catch (error) {
    console.error("Error deleting all cavities:", error);
  }
};

export const deleteUser = async (user_id: string): Promise<void> => {
  try {
    const userCollection = database.collections.get("user");
    console.log({ userCollection });
    const user = await userCollection.find(user_id);
    console.log({ user245: user });
    await database.write(async () => {
      await user.markAsDeleted();
      await user.destroyPermanently();
    });

    console.log("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const deleteProject = async (_id: string): Promise<void> => {
  try {
    const projectCollection = database.collections.get("project");
    const project = await projectCollection.find(_id);

    await database.write(async () => {
      await project.markAsDeleted(); // for syncing
      await project.destroyPermanently(); // hard delete
    });

    console.log("Project deleted successfully!");
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

export const deleteAllProjects = async (): Promise<void> => {
  try {
    const projectCollection = database.collections.get("project");
    const allProjects = await projectCollection.query().fetch();

    await database.write(async () => {
      for (const project of allProjects) {
        await project.markAsDeleted();
        await project.destroyPermanently();
      }
    });

    console.log("All projects deleted successfully!");
  } catch (error) {
    console.error("Error deleting all projects:", error);
  }
};
