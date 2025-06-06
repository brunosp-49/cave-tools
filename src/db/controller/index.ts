import { project } from "./../schemas/project";
import { Q } from "@nozbe/watermelondb";
import {
  Cavidade,
  CavityRegisterData, // Type for data passed to create/update (stringified JSON for complex fields)
  ProjectModel,
  ProjectPayload,
  UserModel,
  TopographyData,
  UploadProjectPayload, // Type for backend sync payload
} from "../../types";
import { database } from "../index";
import CavityRegister from "../model/cavityRegister"; // WatermelonDB Model
import Project from "../model/project"; // WatermelonDB Model
import User from "../model/user"; // WatermelonDB Model
import { api } from "../../api";
import store from "../../redux/store";
import { showError } from "../../redux/loadingSlice";
import { setUserName } from "../../redux/userSlice";
import type Topography from "../model/topography";

// POST
export const createCavityRegister = async (
  // CavityRegisterData expects stringified JSON for complex fields
  cavityData: CavityRegisterData
): Promise<boolean> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");

    await database.write(async () => {
      await cavityCollection.create((cavity) => {
        cavity._raw.id = cavityData.registro_id; // WatermelonDB ID
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
          cavityData.desenvolvimento_linear === null
            ? undefined
            : cavityData.desenvolvimento_linear;
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
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export const createUser = async (userData: UserModel): Promise<void> => {
  try {
    const userCollection = database.collections.get<User>("user");
    await database.write(async () => {
      await userCollection.create((user) => {
        user._raw.id = String(userData.user_id);
        user.user_id = String(userData.user_id);
        user.token = userData.token;
        user.refresh_token = userData.refresh_token;
        user.last_login_date = new Date().toISOString();
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
          project.nome_projeto = projectData.nome_projeto;
          project.inicio = projectData.inicio;
          project.descricao_projeto = projectData.descricao_projeto;
          project.uploaded = true; // Assuming these are synced from server
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
        project.nome_projeto = projectData.nome_projeto;
        project.inicio = projectData.inicio || new Date().toISOString();
        project.descricao_projeto = projectData.descricao_projeto;
        project.uploaded = false; // Newly created locally
      });
    });
    console.log("Project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error);
  }
};

export const createTopography = async (toposData: TopographyData[]): Promise<void> => {
  try {
    const topographyCollection = database.collections.get<Topography>("topography");

    const operations = toposData.map(topoMap => topographyCollection.prepareCreate(topo => {
      topo._raw.id = topoMap.registro_id;
      topo.registro_id = topoMap.registro_id;
      topo.cavity_id = topoMap.cavity_id;
      topo.data = topoMap.data;
      topo.azimuth = topoMap.azimuth;
      topo.distance = topoMap.distance;
      topo.from = topoMap.from;
      topo.incline = topoMap.incline;
      topo.to = topoMap.to;
      topo.turnDown = topoMap.turnDown;
      topo.turnLeft = topoMap.turnLeft;
      topo.turnRight = topoMap.turnRight;
      topo.turnUp = topoMap.turnUp;
    }))

    await database.write(async () => {
      await database.batch(...operations);
    });
    console.log(`Topography created ${toposData.length} successfully!`);
  } catch (error) {
    console.error("Error creating topography:", error);
  }
}

// GET
// This function returns fully parsed Cavidade objects for the frontend
export const fetchAllCavities = async (): Promise<Cavidade[]> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    const cavitiesModels = await cavityCollection.query().fetch();

    return cavitiesModels.map((cm: CavityRegister): Cavidade => {
      const parse = (
        jsonString: string | null | undefined,
        fieldName: string,
        defaultVal: any = {}
      ) => {
        if (typeof jsonString === "string") {
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            console.warn(`Error parsing ${fieldName} for ${cm.registro_id}`, e);
            return defaultVal;
          }
        }
        return defaultVal;
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
        localidade: cm.localidade || undefined,
        desenvolvimento_linear:
          cm.desenvolvimento_linear === null
            ? undefined
            : cm.desenvolvimento_linear,
        entradas: parse(cm.entradas, "entradas", []),
        dificuldades_externas: parse(
          cm.dificuldades_externas,
          "dificuldades_externas"
        ),
        aspectos_socioambientais: parse(
          cm.aspectos_socioambientais,
          "aspectos_socioambientais"
        ),
        caracterizacao_interna: parse(
          cm.caracterizacao_interna,
          "caracterizacao_interna"
        ),
        topografia: parse(cm.topografia, "topografia"),
        morfologia: parse(cm.morfologia, "morfologia"),
        hidrologia: parse(cm.hidrologia, "hidrologia"),
        sedimentos: parse(cm.sedimentos, "sedimentos"),
        espeleotemas: parse(cm.espeleotemas, "espeleotemas"),
        biota: parse(cm.biota, "biota"),
        arqueologia: parse(cm.arqueologia, "arqueologia"),
        paleontologia: parse(cm.paleontologia, "paleontologia"),
      };
    });
  } catch (error) {
    console.error("Error fetching cavities:", error);
    return [];
  }
};

export const fetchPendingCavityCount = async (): Promise<number> => {
  try {
    const count = await database.collections
      .get<CavityRegister>("cavity_register")
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
    const count = await database.collections
      .get<Project>("project")
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
    const users = await database.collections.get<User>("user").query().fetch();
    return users.map((user: User) => ({
      // Map to UserModel
      user_id: user.user_id,
      token: user.token,
      refresh_token: user.refresh_token,
      last_login_date: user.last_login_date,
      user_name: user.user_name,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchAllProjects = async (): Promise<ProjectModel[]> => {
  try {
    const projects = await database.collections
      .get<Project>("project")
      .query()
      .fetch();
    return projects.map((p: Project) => ({
      _id: p.id,
      id: p.id,
      status: 'Aberta',
      nome_projeto: p.nome_projeto,
      inicio: p.inicio,
      descricao_projeto: p.descricao_projeto,
      uploaded: p.uploaded,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const fetchAllTopographies = async (): Promise<TopographyData[]> => {
  try {
    const topographyCollection = database.collections.get<Topography>("topography");
    const topographies = await topographyCollection.query().fetch();

    return topographies.map((topography: any) => topography._raw);
  } catch (error) {
    console.error("Error fetching topographies:", error);
    return [];
  }
};

export const getProjectsWithPendingCavitiesCount =
  async (): Promise<number> => {
    try {
      const allProjects = await database
        .get<Project>("project")
        .query()
        .fetch();
      let projectsWithPendingItems = 0;
      for (const project of allProjects) {
        // IMPORTANT: Assumes CavityRegister model has 'projeto_id' field for this query
        const pendingCavitiesForThisProject = await database
          .get<CavityRegister>("cavity_register")
          .query(
            Q.where("projeto_id", project.id), // This 'projeto_id' is the DB column name
            Q.where("uploaded", false)
          )
          .fetchCount();
        if (project.uploaded === false || pendingCavitiesForThisProject > 0) {
          projectsWithPendingItems++;
        }
      }
      return projectsWithPendingItems;
    } catch (error) {
      console.error("Error counting projects with pending items:", error);
      throw error;
    }
  };

// This function prepares data for the backend sync, using the UploadProjectPayload structure
export const fetchProjectsWithPendingCavities = async (
  projectIdToSync?: string
): Promise<UploadProjectPayload[]> => {
  try {
    const projectCollection = database.get<Project>("project");
    let projectsToQuery = await projectCollection.query().fetch();

    if (projectIdToSync) {
      projectsToQuery = projectsToQuery.filter((p) => p.id === projectIdToSync);
      if (projectsToQuery.length === 0) return [];
    }

    const projectsToSyncAggregated: UploadProjectPayload[] = [];
    const parse = (
      jsonString: string | null | undefined,
      fieldName: string,
      defaultVal: any = {}
    ) => {
      if (typeof jsonString === "string") {
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn(`Error parsing ${fieldName}`, e);
          return defaultVal;
        }
      }
      return defaultVal;
    };

    for (const project of projectsToQuery) {
      // IMPORTANT: Assumes CavityRegister model has 'projeto_id' field
      const pendingCavitiesModels = await database
        .get<CavityRegister>("cavity_register")
        .query(
          Q.where("projeto_id", project.id), // DB column name
          Q.where("uploaded", false)
        )
        .fetch();

      if (project.uploaded === false || pendingCavitiesModels.length > 0) {
        const cavitiesPayload: Cavidade[] = pendingCavitiesModels.map(
          (cm: CavityRegister): Cavidade => {
            let project = {
              registro_id: cm.registro_id,
              projeto_id: cm.projeto_id,
              responsavel: cm.responsavel,
              nome_cavidade: cm.nome_cavidade,
              nome_sistema: cm.nome_sistema,
              data: cm.data,
              municipio: cm.municipio,
              uf: cm.uf,
              localidade: cm.localidade || undefined,
              desenvolvimento_linear:
                cm.desenvolvimento_linear === null
                  ? undefined
                  : cm.desenvolvimento_linear,
              entradas: parse(
                cm.entradas,
                `entradas for ${cm.registro_id}`,
                []
              ),
              dificuldades_externas: parse(
                cm.dificuldades_externas,
                `dificuldades_externas for ${cm.registro_id}`
              ),
              aspectos_socioambientais: parse(
                cm.aspectos_socioambientais,
                `asp_socio for ${cm.registro_id}`
              ),
              caracterizacao_interna: parse(
                cm.caracterizacao_interna,
                `carac_interna for ${cm.registro_id}`
              ),
              topografia: parse(
                cm.topografia,
                `topografia for ${cm.registro_id}`
              ),
              morfologia: parse(
                cm.morfologia,
                `morfologia for ${cm.registro_id}`
              ),
              hidrologia: parse(
                cm.hidrologia,
                `hidrologia for ${cm.registro_id}`
              ),
              sedimentos: parse(
                cm.sedimentos,
                `sedimentos for ${cm.registro_id}`
              ),
              espeleotemas: parse(
                cm.espeleotemas,
                `espeleotemas for ${cm.registro_id}`
              ),
              biota: parse(cm.biota, `biota for ${cm.registro_id}`),
              arqueologia: parse(
                cm.arqueologia,
                `arqueologia for ${cm.registro_id}`
              ),
              paleontologia: parse(
                cm.paleontologia,
                `paleontologia for ${cm.registro_id}`
              ),
            };

            return {
              ...project,
              caracterizacao_interna: {
                ...project.caracterizacao_interna,
                estado_conservacao: project.caracterizacao_interna
                  .depredacao_localizada
                  ? "Depredação localizada"
                  : project.caracterizacao_interna
                  .depredacao_intensa ? 'Depredação intensa'
                  : "Conservada",
              },
            };
          }
        );

        projectsToSyncAggregated.push({
          _id: project.id,
          nome_projeto: project.nome_projeto,
          inicio: project.inicio,
          descricao_projeto: project.descricao_projeto,
          cavities: cavitiesPayload,
          status: "Ativo",
        });
      }
    }
    return projectsToSyncAggregated;
  } catch (error) {
    console.error("Error fetching projects with pending items data:", error);
    throw error;
  }
};

// UPDATE

export const updateCavity = async (
  registro_id: string,
  updatedData: Partial<Omit<CavityRegisterData, "registro_id">>
): Promise<void> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    const cavity = await cavityCollection.find(registro_id);

    await database.write(async () => {
      await cavity.update((cav) => {
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
        cav.dificuldades_externas =
          updatedData.dificuldades_externas || cav.dificuldades_externas;
        cav.aspectos_socioambientais =
          updatedData.aspectos_socioambientais || cav.aspectos_socioambientais;
        cav.caracterizacao_interna =
          updatedData.caracterizacao_interna || cav.caracterizacao_interna;
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
        proj.nome_projeto = updatedData.nome_projeto || proj.nome_projeto;
        proj.inicio = updatedData.inicio || proj.inicio;
        proj.descricao_projeto =
          updatedData.descricao_projeto || proj.descricao_projeto;
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
    console.log("[DB Controller] No project packages to sync.");
    return { success: true };
  }

  const totalItemsToUpload = projectsToSync.length;
  let successfullyUploadedPackages = 0;
  const errors: string[] = [];

  for (let i = 0; i < projectsToSync.length; i++) {
    const projectPackage = projectsToSync[i];
    try {
      console.log(
        `[DB Controller] Attempting to sync package for project: ${projectPackage.nome_projeto} (Local ID: ${projectPackage._id}) with ${projectPackage.cavities.length} cavities.`
      );
      const users = await fetchAllUsers();
      const user = users[0];
      console.log({ projectPackage });
      // O payload enviado para a API é o projectPackage inteiro
      const response = await api.post("/projetos/app_upload/", projectPackage, {
        headers: { Authorization: `Bearer ${user.token}` },
      }); // Adapte o endpoint
      console.log({ response });
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.status === 204
      ) {
        await database.write(async () => {
          const localProject = await database
            .get<Project>("project")
            .find(projectPackage._id);
          if (localProject && !localProject.uploaded) {
            await localProject.update((p) => {
              p.uploaded = true;
            });
            console.log(
              `[DB Controller] Project ${localProject.nome_projeto} marked as uploaded.`
            );
          }

          for (const syncedCavity of projectPackage.cavities) {
            // Usa projectPackage.projects
            const localCavities = await database
              .get<CavityRegister>("cavity_register")
              .query(Q.where("registro_id", syncedCavity.registro_id))
              .fetch();
            if (localCavities.length > 0) {
              const localCavity = localCavities[0];
              if (!localCavity.uploaded) {
                await localCavity.update((c) => {
                  c.uploaded = true;
                });
                console.log(
                  `[DB Controller] Cavity ${localCavity.nome_cavidade} (Reg ID: ${localCavity.registro_id}) marked as uploaded.`
                );
              }
            } else {
              console.warn(
                `[DB Controller] Local cavity with registro_id ${syncedCavity.registro_id} not found after sync for project ${projectPackage.nome_projeto}.`
              );
            }
          }
        });
        successfullyUploadedPackages++;
      } else {
        const errorMsg = `Projeto ${
          projectPackage.nome_projeto
        }: Falha no envio (status ${response.status} - ${
          response.data?.detail ||
          response.data?.message ||
          "Erro desconhecido da API"
        })`;
        errors.push(errorMsg);
        console.error(
          `[DB Controller] Failed to sync project package ${projectPackage.nome_projeto}:`,
          response.status,
          response.data
        );
      }
    } catch (error: any) {
      console.log({ error: error.message });
      const errorMsg = `Projeto ${projectPackage.nome_projeto}: ${
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "Erro de rede ou desconhecido"
      }`;
      errors.push(errorMsg);
      console.error(
        `[DB Controller] Error syncing project package ${projectPackage.nome_projeto}:`,
        error
      );
    }
    onProgress?.(Math.round(((i + 1) / totalItemsToUpload) * 100));
  }

  if (errors.length === 0) {
    console.log("[DB Controller] Consolidated upload fully successful.");
    return { success: true };
  } else {
    console.error(
      "[DB Controller] Consolidated upload finished with errors:",
      errors
    );
    return { success: false, error: errors.join("; \n") };
  }
};

export const updateTopography = async (registro_id: string, updatedData: Partial<TopographyData>): Promise<void> => {
  try {
    const topographyCollection = database.collections.get<Topography>("topography");
    const topography = await topographyCollection.find(registro_id);

    await database.write(async () => {
      await topography.update((topo) => {
        topo.from = updatedData.from || topo.from;
        topo.incline = updatedData.incline || topo.incline;
        topo.to = updatedData.to || topo.to;
        topo.turnDown = updatedData.turnDown || topo.turnDown;
        topo.turnLeft = updatedData.turnLeft || topo.turnLeft;
        topo.turnRight = updatedData.turnRight || topo.turnRight;
        topo.turnUp = updatedData.turnUp || topo.turnUp;
      });
    });

    console.log("Topography updated successfully!");
  } catch (error) {
    console.error("Error updating Topography:", error);
  }
};

// DELETE
export const deleteCavity = async (registro_id: string): Promise<void> => {
  try {
    const cavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query(Q.where("registro_id", registro_id))
      .fetch();
    if (cavities.length > 0) {
      await database.write(async () => {
        await cavities[0].markAsDeleted();
        await cavities[0].destroyPermanently();
      });
      console.log("Cavity deleted successfully!");
    }
  } catch (error) {
    console.error("Error deleting cavity:", error);
  }
};

export const deleteAllCavities = async (): Promise<void> => {
  try {
    const allCavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query()
      .fetch();
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
  // Assumes user_id is WDB ID
  try {
    const user = await database.collections.get<User>("user").find(user_id);
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
  // Assumes _id is WDB ID
  try {
    const project = await database.collections
      .get<Project>("project")
      .find(_id);
    // Also delete associated cavities
    const associatedCavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query(Q.where("projeto_id", _id))
      .fetch(); // Assumes DB model has projeto_id

    await database.write(async () => {
      for (const cavity of associatedCavities) {
        await cavity.markAsDeleted();
        await cavity.destroyPermanently();
      }
      await project.markAsDeleted();
      await project.destroyPermanently();
    });
    console.log("Project and associated cavities deleted successfully!");
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};

export const deleteAllProjects = async (): Promise<void> => {
  try {
    const allProjects = await database.collections
      .get<Project>("project")
      .query()
      .fetch();
    await database.write(async () => {
      for (const project of allProjects) {
        const associatedCavities = await database.collections
          .get<CavityRegister>("cavity_register")
          .query(Q.where("projeto_id", project.id))
          .fetch(); // Assumes DB model has projeto_id
        for (const cavity of associatedCavities) {
          await cavity.markAsDeleted();
          await cavity.destroyPermanently();
        }
        await project.markAsDeleted();
        await project.destroyPermanently();
      }
    });
    // Also delete all cavities that might not be associated with any project (orphaned)
    await deleteAllCavities();
    console.log("All projects and cavities deleted successfully!");
  } catch (error) {
    console.error("Error deleting all projects and cavities:", error);
  }
};

export const deleteTopography = async (registro_id: string): Promise<void> => {
  try {
    const topographyCollection = database.collections.get<Topography>("topography");
    const topography = await topographyCollection.find(registro_id);

    await database.write(async () => {
      await topography.markAsDeleted();
      await topography.destroyPermanently();
    });

    console.log("Topography deleted successfully!");
  } catch (error) {
    console.error("Error deleting topography:", error);
  }
}