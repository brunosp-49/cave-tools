import { Q } from "@nozbe/watermelondb";
import {
  Cavidade,
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
import User from "../model/user";
import { setUserName } from "../../redux/userSlice";

export interface UploadProjectPayload {
  _id: string;
  fk_cliente: string;
  nome_projeto: string;
  inicio: string;
  descricao_projeto: string;
  responsavel: string;
  cavities: Cavidade[]; // Array de cavidades pendentes renomeado para 'projects'
  // Adicione 'uploaded?: boolean;' se o backend precisar desta informação sobre o projeto em si.
}

// POST
export const createCavityRegister = async (
  cavityData: CavityRegisterData
): Promise<boolean> => {
  try {
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
    const userCollection = database.collections.get<User>("user");
    console.log("Creating user:", userData);
    await database.write(async () => {
      await userCollection.create((user) => {
        user._raw.id = String(userData.user_id);
        user.user_id = String(userData.user_id);
        user.token = userData.token;
        user.refresh_token = userData.refresh_token;
        user.last_login_date = String(new Date());
        user.user_name = userData.user_name;
      });
    });
    store.dispatch(setUserName(userData.user_name));
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
          project.fk_cliente = String(projectData.fk_cliente);
          project.nome_projeto = projectData.nome_projeto;
          project.inicio = projectData.inicio;
          project.descricao_projeto = projectData.descricao_projeto;
          project.responsavel = projectData.responsavel;
          project.uploaded = true;
        });
      }
    });

    console.log("Projects created successfully!");
  } catch (error) {
    console.error("Error creating projects:", error);
  }
};

export const createProject = async (
  projectData: ProjectPayload
): Promise<void> => {
  try {
    const projectCollection = database.collections.get<Project>("project");

    await database.write(async () => {
      await projectCollection.create((project) => {
        project._raw.id = String(projectData.id);
        project.fk_cliente = String(projectData.fk_cliente);
        project.nome_projeto = projectData.nome_projeto;
        project.inicio = String(new Date());
        project.descricao_projeto = projectData.descricao_projeto;
        project.responsavel = projectData.responsavel;
        project.uploaded = false;
      });
    });

    console.log("Project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error);
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

export const fetchPendingProjectCount = async (): Promise<number> => {
  try {
    const projectCollection = database.collections.get<Project>("project");
    const count = await projectCollection
      .query(Q.where("uploaded", false))
      .fetchCount();
    return count;
  } catch (error) {
    console.error("Error fetching pending project count:", error);
    return 0;
  }
};

export const fetchAllUsers = async (): Promise<UserModel[]> => {
  try {
    const userCollection = database.collections.get<User>("user");
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
      _id: project._raw.id,
      fk_cliente: project.fk_cliente,
      nome_projeto: project.nome_projeto,
      inicio: project.inicio,
      descricao_projeto: project.descricao_projeto,
      responsavel: project.responsavel,
      uploaded: project.uploaded,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getProjectsWithPendingCavitiesCount = async (): Promise<number> => {
  try {
    const projectCollection = database.get<Project>('project');
    const allProjects = await projectCollection.query().fetch();
    let projectsWithPendingCavities = 0;

    for (const project of allProjects) {
      const cavityCollection = database.get<CavityRegister>('cavity_register');
      // Verifica se o projeto em si está pendente OU se tem cavidades pendentes
      const pendingCavitiesForThisProject = await cavityCollection.query(
        Q.where('projeto_id', project.id), 
        Q.where('uploaded', false)
      ).fetchCount();

      // Inclui o projeto na contagem se ele próprio não foi carregado OU se tem cavidades pendentes
      if (project.uploaded === false || pendingCavitiesForThisProject > 0) {
        projectsWithPendingCavities++;
      }
    }
    console.log('[DB Controller] Count of projects with pending items (project or cavities):', projectsWithPendingCavities);
    return projectsWithPendingCavities;
  } catch (error) {
    console.error("[DB Controller] Error counting projects with pending items:", error);
    throw error; 
  }
};

export const fetchProjectsWithPendingCavities = async (): Promise<UploadProjectPayload[]> => {
  try {
    const projectCollection = database.get<Project>('project');
    const allProjects = await projectCollection.query().fetch();
    const projectsToSyncAggregated: UploadProjectPayload[] = [];

    for (const project of allProjects) {
      const cavityCollection = database.get<CavityRegister>('cavity_register');
      const pendingCavitiesModels = await cavityCollection.query(
        Q.where('projeto_id', project.id), 
        Q.where('uploaded', false) 
      ).fetch();

      // Inclui o projeto se ele próprio não foi carregado OU se tem cavidades pendentes
      if (project.uploaded === false || pendingCavitiesModels.length > 0) {
        const cavitiesPayload: Cavidade[] = pendingCavitiesModels.map(cm => {
          const parseJsonField = (fieldData: string | null | undefined, fieldName: string) => {
            if (typeof fieldData === 'string') {
              try {
                return JSON.parse(fieldData);
              } catch (e) {
                console.warn(`[DB Controller] Failed to parse JSON for field ${fieldName} in cavity ${cm.registro_id}:`, fieldData, e);
                return null; 
              }
            }
            return fieldData; 
          };

          return {
            registro_id: cm.registro_id,
            projeto_id: cm.projeto_id, 
            responsavel: cm.responsavel,
            nome_cavidade: cm.nome_cavidade,
            nome_sistema: cm.nome_sistema,
            data: cm.data, 
            municipio: cm.municipio,
            uf: cm.uf,
            localidade: cm.localidade,
            entradas: parseJsonField(cm.entradas, 'entradas') || [],
            desenvolvimento_linear: cm.desenvolvimento_linear,
            dificuldades_externas: parseJsonField(cm.dificuldades_externas, 'dificuldades_externas'),
            aspectos_socioambientais: parseJsonField(cm.aspectos_socioambientais, 'aspectos_socioambientais'),
            caracterizacao_interna: parseJsonField(cm.caracterizacao_interna, 'caracterizacao_interna'),
            topografia: parseJsonField(cm.topografia, 'topografia'),
            morfologia: parseJsonField(cm.morfologia, 'morfologia'),
            hidrologia: parseJsonField(cm.hidrologia, 'hidrologia'),
            sedimentos: parseJsonField(cm.sedimentos, 'sedimentos'),
            espeleotemas: parseJsonField(cm.espeleotemas, 'espeleotemas'),
            biota: parseJsonField(cm.biota, 'biota'),
            arqueologia: parseJsonField(cm.arqueologia, 'arqueologia'),
            paleontologia: parseJsonField(cm.paleontologia, 'paleontologia'),
            // Não incluir 'uploaded' no payload da cavidade para a API, a menos que a API espere.
          } as Cavidade;
        });
        
        projectsToSyncAggregated.push({
            _id: project.id, // ID local para referência
            fk_cliente: project.fk_cliente,
            nome_projeto: project.nome_projeto,
            inicio: project.inicio,
            descricao_projeto: project.descricao_projeto,
            responsavel: project.responsavel,
            // uploaded: project.uploaded, // Opcional: enviar o estado de upload do projeto
            cavities: cavitiesPayload, // Renomeado para 'projects'
        });
      }
    }
    console.log('[DB Controller] Projects with pending items data fetched:', projectsToSyncAggregated.length);
    return projectsToSyncAggregated;
  } catch (error) {
    console.error("[DB Controller] Error fetching projects with pending items data:", error);
    throw error;
  }
};

// UPDATE

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
        cav._raw.id = updatedData.registro_id || cav._raw.id;
        cav.registro_id = updatedData.registro_id || cav.registro_id;
        cav.projeto_id = updatedData.projeto_id || cav.projeto_id;
        cav.responsavel = updatedData.responsavel || cav.responsavel;
        cav.nome_cavidade = updatedData.nome_cavidade || cav.nome_cavidade;
        cav.nome_sistema = updatedData.nome_sistema || cav.nome_sistema;
        cav.data = updatedData.data || cav.data;
        cav.municipio = updatedData.municipio || cav.municipio;
        cav.uf = updatedData.uf || cav.uf;
        cav.localidade = updatedData.localidade || cav.localidade;
        cav.entradas = updatedData.entradas || cav.entradas;
        cav.desenvolvimento_linear =
          updatedData.desenvolvimento_linear || cav.desenvolvimento_linear;
        cav.dificuldades_externas = updatedData.dificuldades_externas || cav.dificuldades_externas;
        cav.aspectos_socioambientais = updatedData.aspectos_socioambientais || cav.aspectos_socioambientais;
        cav.caracterizacao_interna = updatedData.caracterizacao_interna || cav.caracterizacao_interna;
        cav.topografia = updatedData.topografia || cav.topografia;
        cav.morfologia = updatedData.morfologia || cav.morfologia;
        cav.hidrologia = updatedData.hidrologia || cav.hidrologia;
        cav.sedimentos = updatedData.sedimentos || cav.sedimentos;
        cav.espeleotemas = updatedData.espeleotemas || cav.espeleotemas;
        cav.biota = updatedData.biota || cav.biota;
        cav.arqueologia = updatedData.arqueologia || cav.arqueologia;
        cav.paleontologia = updatedData.paleontologia || cav.paleontologia;
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
    const userCollection = database.collections.get<User>("user");
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

export const updateProject = async (
  project_id: string,
  updatedData: Partial<ProjectPayload>
): Promise<void> => {
  try {
    const projectCollection = database.collections.get<Project>("project");
    const project = await projectCollection.find(project_id);

    await database.write(async () => {
      await project.update((proj) => {
        proj.fk_cliente = String(updatedData.fk_cliente) || proj.fk_cliente;
        proj.nome_projeto = updatedData.nome_projeto || proj.nome_projeto;
        proj.inicio = updatedData.inicio || proj.inicio;
        proj.descricao_projeto =
          updatedData.descricao_projeto || proj.descricao_projeto;
        proj.responsavel = updatedData.responsavel || proj.responsavel;
        proj.uploaded = proj.uploaded;
      });
    });

    console.log("Project updated successfully!");
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

export const syncConsolidatedUpload = async (
  projectsToSync: UploadProjectPayload[],
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> => {
  if (!projectsToSync || projectsToSync.length === 0) {
    onProgress?.(100);
    console.log('[DB Controller] No project packages to sync.');
    return { success: true };
  }

  const totalItemsToUpload = projectsToSync.length;
  let successfullyUploadedPackages = 0;
  const errors: string[] = [];

  for (let i = 0; i < projectsToSync.length; i++) {
    const projectPackage = projectsToSync[i];
    try {
      console.log(`[DB Controller] Attempting to sync package for project: ${projectPackage.nome_projeto} (Local ID: ${projectPackage._id}) with ${projectPackage.cavities.length} cavities.`);
      console.log(JSON.stringify(projectPackage))
      // O payload enviado para a API é o projectPackage inteiro
      const response = await api.post('/sync/project-package/', projectPackage); // Adapte o endpoint

      if (response.status === 200 || response.status === 201 || response.status === 204) {
        await database.write(async () => {
          const localProject = await database.get<Project>('project').find(projectPackage._id);
          if (localProject && !localProject.uploaded) { 
            await localProject.update(p => { p.uploaded = true; });
             console.log(`[DB Controller] Project ${localProject.nome_projeto} marked as uploaded.`);
          }

          for (const syncedCavity of projectPackage.cavities) { // Usa projectPackage.projects
            const localCavities = await database.get<CavityRegister>('cavity_register').query(Q.where('registro_id', syncedCavity.registro_id)).fetch();
            if (localCavities.length > 0) {
                const localCavity = localCavities[0];
                if (!localCavity.uploaded) { 
                    await localCavity.update(c => { c.uploaded = true; });
                    console.log(`[DB Controller] Cavity ${localCavity.nome_cavidade} (Reg ID: ${localCavity.registro_id}) marked as uploaded.`);
                }
            } else {
                console.warn(`[DB Controller] Local cavity with registro_id ${syncedCavity.registro_id} not found after sync for project ${projectPackage.nome_projeto}.`);
            }
          }
        });
        successfullyUploadedPackages++;
      } else {
        const errorMsg = `Projeto ${projectPackage.nome_projeto}: Falha no envio (status ${response.status} - ${response.data?.detail || response.data?.message || 'Erro desconhecido da API'})`;
        errors.push(errorMsg);
        console.error(`[DB Controller] Failed to sync project package ${projectPackage.nome_projeto}:`, response.status, response.data);
      }
    } catch (error: any) {
      const errorMsg = `Projeto ${projectPackage.nome_projeto}: ${error.response?.data?.detail || error.response?.data?.message || error.message || 'Erro de rede ou desconhecido'}`;
      errors.push(errorMsg);
      console.error(`[DB Controller] Error syncing project package ${projectPackage.nome_projeto}:`, error);
    }
    onProgress?.(Math.round(((i + 1) / totalItemsToUpload) * 100));
  }

  if (errors.length === 0) {
    console.log('[DB Controller] Consolidated upload fully successful.');
    return { success: true };
  } else {
    console.error('[DB Controller] Consolidated upload finished with errors:', errors);
    return { success: false, error: errors.join('; \n') };
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
    const userCollection = database.collections.get<User>("user");
    const user = await userCollection.find(user_id);
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
