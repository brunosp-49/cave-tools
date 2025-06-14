import { project } from "./../schemas/project";
import { Q } from "@nozbe/watermelondb";
import {
  Cavidade,
  CavityRegisterData,
  ProjectModel,
  ProjectPayload,
  UserModel,
  TopographyData,
  UploadProjectPayload,
} from "../../types";
import { database } from "../index";
import CavityRegister from "../model/cavityRegister";
import Project from "../model/project";
import User from "../model/user";
import { api } from "../../api";
import store from "../../redux/store";
import { showError } from "../../redux/loadingSlice";
import { setUserName } from "../../redux/userSlice";
import type Topography from "../model/topography";
import { convertDdMmYyyyToYyyyMmDd } from "../../util"; // Assuming this is defined in your util.ts

export interface FailedCavity {
  registro_id: string;
  nome_cavidade: string;
  error: string;
}

const parseJsonField = (
  jsonString: string | null | undefined,
  fieldName: string,
  defaultVal: any = {}
) => {
  if (typeof jsonString === "string") {
    try {
      // Check if it's an empty object string, return undefined to match backend expectation for null/empty
      if(jsonString === "{}") return undefined;
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn(`Error parsing ${fieldName}:`, e);
      return defaultVal;
    }
  }
  return defaultVal;
};

/**
 * Recursively removes 'outroEnabled' properties from an object.
 * @param obj The object to clean.
 * @returns The cleaned object.
 */
function cleanObjectForUpload(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => cleanObjectForUpload(item));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (key === 'outroEnabled') {
                continue; // Skip this key
            }
            newObj[key] = cleanObjectForUpload(obj[key]);
        }
    }
    return newObj;
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
        const existingProject = await projectCollection.find(String(projectData.id)).catch(() => null);

        if (existingProject) {
          await existingProject.update((project) => {
            project.nome_projeto = projectData.nome_projeto;
            project.inicio = projectData.inicio;
            project.descricao_projeto = projectData.descricao_projeto;
            project.uploaded = true;
          });
          console.log(`Project ${projectData.nome_projeto} (ID: ${projectData.id}) updated successfully.`);
        } else {
          await projectCollection.create((project) => {
            project._raw.id = String(projectData.id);
            project.nome_projeto = projectData.nome_projeto;
            project.inicio = projectData.inicio;
            project.descricao_projeto = projectData.descricao_projeto;
            project.uploaded = true;
          });
          console.log(`Project ${projectData.nome_projeto} (ID: ${projectData.id}) created successfully.`);
        }
      }
    });
  } catch (error) {
    console.error("Error creating/updating projects:", error);
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
        project.uploaded = false;
      });
    });
    console.log("Project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error);
  }
};

export const createTopography = async (
  toposData: TopographyData[]
): Promise<void> => {
  try {
    const topographyCollection =
      database.collections.get<Topography>("topography");

    const operations = toposData.map((topoMap) =>
      topographyCollection.prepareCreate((topo) => {
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
      })
    );

    await database.write(async () => {
      await database.batch(...operations);
    });
    console.log(`Topography created ${toposData.length} successfully!`);
  } catch (error) {
    console.error("Error creating topography:", error);
  }
};

export const createCavitiesFromServer = async (
  cavities: any[]
): Promise<void> => {
  try {
    const cavityCollection = database.collections.get<CavityRegister>("cavity_register");

    await database.write(async () => {
      for (const cavityData of cavities) {
        const existingCavity = await cavityCollection.find(String(cavityData.id)).catch(() => null);

        const entradasString = JSON.stringify(cavityData.entradas || []);
        const dificuldadesExternasString = JSON.stringify(cavityData.dificuldades_externas || {});
        const aspectosSocioambientaisString = JSON.stringify(cavityData.aspectos_socioambientais || {});
        const caracterizacaoInternaString = JSON.stringify(cavityData.caracterizacao_interna || {});
        const topografiaString = JSON.stringify(cavityData.topografia || {});
        const morfologiaString = JSON.stringify(cavityData.morfologia || {});
        const hidrologiaString = JSON.stringify(cavityData.hidrologia || {});
        const sedimentosString = JSON.stringify(cavityData.sedimentos || {});
        const espeleotemasString = JSON.stringify(cavityData.espeleotemas || {});
        const biotaString = JSON.stringify(cavityData.biota || {});
        const arqueologiaString = JSON.stringify(cavityData.arqueologia || {});
        const paleontologiaString = JSON.stringify(cavityData.paleontologia || {});


        if (existingCavity) {
          await existingCavity.update((cav) => {
            cav.registro_id = cavityData.registro_id;
            cav.projeto_id = String(cavityData.projeto);
            cav.responsavel = cavityData.responsavel;
            cav.nome_cavidade = cavityData.nome_cavidade;
            cav.nome_sistema = cavityData.nome_sistema;
            cav.data = cavityData.data;
            cav.municipio = cavityData.municipio;
            cav.uf = cavityData.uf;
            cav.localidade = cavityData.localidade || undefined;
            cav.desenvolvimento_linear = cavityData.desenvolvimento_linear;
            cav.entradas = entradasString;
            cav.dificuldades_externas = dificuldadesExternasString;
            cav.aspectos_socioambientais = aspectosSocioambientaisString;
            cav.caracterizacao_interna = caracterizacaoInternaString;
            cav.topografia = topografiaString;
            cav.morfologia = morfologiaString;
            cav.hidrologia = hidrologiaString;
            cav.sedimentos = sedimentosString;
            cav.espeleotemas = espeleotemasString;
            cav.biota = biotaString;
            cav.arqueologia = arqueologiaString;
            cav.paleontologia = paleontologiaString;
            cav.uploaded = true;
          });
          console.log(`Cavity ${cavityData.nome_cavidade} (ID: ${cavityData.id}) updated successfully.`);
        } else {
          await cavityCollection.create((cav) => {
            cav._raw.id = String(cavityData.id);
            cav.registro_id = cavityData.registro_id;
            cav.projeto_id = String(cavityData.projeto);
            cav.responsavel = cavityData.responsavel;
            cav.nome_cavidade = cavityData.nome_cavidade;
            cav.nome_sistema = cavityData.nome_sistema;
            cav.data = cavityData.data;
            cav.municipio = cavityData.municipio;
            cav.uf = cavityData.uf;
            cav.localidade = cavityData.localidade || undefined;
            cav.desenvolvimento_linear = cavityData.desenvolvimento_linear;
            cav.entradas = entradasString;
            cav.dificuldades_externas = dificuldadesExternasString;
            cav.aspectos_socioambientais = aspectosSocioambientaisString;
            cav.caracterizacao_interna = caracterizacaoInternaString;
            cav.topografia = topografiaString;
            cav.morfologia = morfologiaString;
            cav.hidrologia = hidrologiaString;
            cav.sedimentos = sedimentosString;
            cav.espeleotemas = espeleotemasString;
            cav.biota = biotaString;
            cav.arqueologia = arqueologiaString;
            cav.paleontologia = paleontologiaString;
            cav.uploaded = true;
          });
          console.log(`Cavity ${cavityData.nome_cavidade} (ID: ${cavityData.id}) created successfully.`);
        }
      }
    });
  } catch (error) {
    console.error("Error creating/updating cavities from server:", error);
    throw error;
  }
};


// GET
export const fetchAllCavities = async (): Promise<Cavidade[]> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    const cavitiesModels = await cavityCollection.query().fetch();

    return cavitiesModels.map((cm: CavityRegister): Cavidade => {
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
        entradas: parseJsonField(cm.entradas, "entradas", []),
        dificuldades_externas: parseJsonField(
          cm.dificuldades_externas,
          "dificuldades_externas"
        ),
        aspectos_socioambientais: parseJsonField(
          cm.aspectos_socioambientais,
          "aspectos_socioambientais"
        ),
        caracterizacao_interna: parseJsonField(
          cm.caracterizacao_interna,
          "caracterizacao_interna"
        ),
        topografia: parseJsonField(cm.topografia, "topografia"),
        morfologia: parseJsonField(cm.morfologia, "morfologia"),
        hidrologia: parseJsonField(cm.hidrologia, "hidrologia"),
        sedimentos: parseJsonField(cm.sedimentos, "sedimentos"),
        espeleotemas: parseJsonField(cm.espeleotemas, "espeleotemas"),
        biota: parseJsonField(cm.biota, "biota"),
        arqueologia: parseJsonField(cm.arqueologia, "arqueologia"),
        paleontologia: parseJsonField(cm.paleontologia, "paleontologia"),
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
      status: "Aberta",
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
    const topographyCollection =
      database.collections.get<Topography>("topography");
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
        const pendingCavitiesForThisProject = await database
          .get<CavityRegister>("cavity_register")
          .query(
            Q.where("projeto_id", project.id),
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
          if(jsonString === "{}") return undefined;
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn(`Error parsing ${fieldName}`, e);
          return defaultVal;
        }
      }
      return defaultVal;
    };

    for (const project of projectsToQuery) {
      const pendingCavitiesModels = await database
        .get<CavityRegister>("cavity_register")
        .query(
          Q.where("projeto_id", project.id),
          Q.where("uploaded", false)
        )
        .fetch();

      if (project.uploaded === false || pendingCavitiesModels.length > 0) {
        console.log({pendingCavitiesModels})
        const cavitiesPayload: Cavidade[] = pendingCavitiesModels.map(
          (cm: CavityRegister): Cavidade => {
            let cavityData = {
              registro_id: cm.registro_id,
              projeto_id: cm.projeto_id,
              responsavel: cm.responsavel,
              nome_cavidade: cm.nome_cavidade,
              nome_sistema: cm.nome_sistema,
              data: convertDdMmYyyyToYyyyMmDd(cm.data), // Date format conversion
              municipio: cm.municipio,
              uf: cm.uf,
              localidade: cm.localidade || undefined,
              desenvolvimento_linear:
                cm.desenvolvimento_linear === null
                  ? undefined
                  : cm.desenvolvimento_linear,
              // Parse all nested JSON fields back into objects
              entradas: parse(cm.entradas, `entradas for ${cm.registro_id}`, []),
              dificuldades_externas: parse(cm.dificuldades_externas, `dificuldades_externas for ${cm.registro_id}`),
              aspectos_socioambientais: parse(cm.aspectos_socioambientais, `asp_socio for ${cm.registro_id}`),
              caracterizacao_interna: parse(cm.caracterizacao_interna, `carac_interna for ${cm.registro_id}`),
              topografia: parse(cm.topografia, `topografia for ${cm.registro_id}`),
              morfologia: parse(cm.morfologia, `morfologia for ${cm.registro_id}`),
              hidrologia: parse(cm.hidrologia, `hidrologia for ${cm.registro_id}`),
              sedimentos: parse(cm.sedimentos, `sedimentos for ${cm.registro_id}`),
              espeleotemas: parse(cm.espeleotemas, `espeleotemas for ${cm.registro_id}`),
              biota: parse(cm.biota, `biota for ${cm.registro_id}`),
              arqueologia: parse(cm.arqueologia, `arqueologia for ${cm.registro_id}`),
              paleontologia: parse(cm.paleontologia, `paleontologia for ${cm.registro_id}`),
              status: "ativo" // Assuming a default status for upload
            };

            // This is where you would traditionally clean `outroEnabled`
            // and adjust structures before re-stringifying for the final payload.
            // But we're now doing this in `syncConsolidatedUpload` with `cleanObjectForUpload`.

            return cavityData; // Return as Cavidade (unstringified)
          }
        );
        console.log({cavitiesPayload})
        projectsToSyncAggregated.push({
          _id: project.id,
          nome_projeto: project.nome_projeto,
          inicio: project.inicio,
          descricao_projeto: project.descricao_projeto,
          cavities: cavitiesPayload, // This is an array of Cavidade
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
): Promise<{ success: boolean; error?: string; failedCavities?: FailedCavity[] }> => {
  if (!projectsToSync || projectsToSync.length === 0) {
    onProgress?.(100);
    console.log("[DB Controller] No project packages to sync.");
    return { success: true };
  }

  const totalItemsToUpload = projectsToSync.length;
  let successfullyUploadedPackages = 0;
  const projectErrors: string[] = [];
  const failedCavityDetails: FailedCavity[] = [];

  for (let i = 0; i < projectsToSync.length; i++) {
    const projectPackage = projectsToSync[i];
    try {
      console.log(
        `[DB Controller] Attempting to sync package for project: ${projectPackage.nome_projeto} (Local ID: ${projectPackage._id}) with ${projectPackage.cavities.length} cavities.`
      );
      const users = await fetchAllUsers();
      const user = users[0];

      // Deep copy and clean the projectPackage before sending
      const cleanedProjectPackage = cleanObjectForUpload(projectPackage);

      const response = await api.post("/projetos/app_upload/", cleanedProjectPackage, { // Send the cleaned object
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log({response})
      const responseData = response.data;

      if (
        (response.status === 200 ||
          response.status === 201 ||
          response.status === 204)
      ) {
        if (responseData.detail || responseData.message) {
            const overallError = typeof responseData.detail === 'string' ? responseData.detail : JSON.stringify(responseData.detail || responseData.message);
            projectErrors.push(`Projeto ${projectPackage.nome_projeto}: ${overallError}`);
            console.error(`[DB Controller] Project ${projectPackage.nome_projeto} returned overall error:`, overallError);
        }

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

          for (const backendCavity of responseData.cavities || []) {
            const localCavities = await database
              .get<CavityRegister>("cavity_register")
              .query(Q.where("registro_id", backendCavity.registro_id))
              .fetch();

            if (localCavities.length > 0) {
              const localCavity = localCavities[0];
              await localCavity.update((c) => {
                c._raw.id = String(backendCavity.id);
                c.registro_id = String(backendCavity.id);
                c.uploaded = true;
              });
              console.log(
                `[DB Controller] Cavity ${localCavity.nome_cavidade} (Old Reg ID: ${backendCavity.registro_id}) updated to New ID: ${backendCavity.id} and marked as uploaded.`
              );
            } else {
              console.warn(
                `[DB Controller] Local cavity with registro_id ${backendCavity.registro_id} not found for update after successful sync. Project: ${projectPackage.nome_projeto}. This cavity was uploaded but local record cannot be updated.`
              );
            }
          }
        });
        successfullyUploadedPackages++;

        if (responseData.cavities_errors && responseData.cavities_errors.length > 0) {
            responseData.cavities_errors.forEach((errorItem: { registro_id: string; error: any }) => {
                const originalCavity = projectPackage.cavities.find(c => c.registro_id === errorItem.registro_id);
                const cavErrorMsg = typeof errorItem.error === 'string' ? errorItem.error : JSON.stringify(errorItem.error);
                failedCavityDetails.push({
                    registro_id: errorItem.registro_id,
                    nome_cavidade: originalCavity?.nome_cavidade || "Nome Desconhecido",
                    error: cavErrorMsg
                });
            });
            console.warn(`[DB Controller] Project ${projectPackage.nome_projeto} reported ${responseData.cavities_errors.length} failed cavities.`);
        }
      } else {
        const errorDetails = typeof responseData.detail === 'string' ? responseData.detail : JSON.stringify(responseData.detail || responseData.message || "Erro desconhecido da API");
        projectErrors.push(`Projeto ${projectPackage.nome_projeto}: Falha no envio (status ${response.status} - ${errorDetails})`);
        console.error(
          `[DB Controller] Failed to sync project package ${projectPackage.nome_projeto}: HTTP Status ${response.status}, Data:`,
          responseData
        );
        projectPackage.cavities.forEach(cav => {
            failedCavityDetails.push({
                registro_id: cav.registro_id,
                nome_cavidade: cav.nome_cavidade,
                error: `Falha no envio do projeto: ${errorDetails}`
            });
        });
      }
    } catch (error: any) {
      let detailedErrorMessage = error.response?.data?.detail || error.response?.data?.message;
      if (!detailedErrorMessage) {
          detailedErrorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error.message || error);
      }

      const errorMsg = `Projeto ${projectPackage.nome_projeto}: ${detailedErrorMessage || "Erro desconhecido"}`;
      projectErrors.push(errorMsg);
      console.error(
        `[DB Controller] Error syncing project package ${projectPackage.nome_projeto}:`,
        error
      );
      projectPackage.cavities.forEach(cav => {
          failedCavityDetails.push({
              registro_id: cav.registro_id,
              nome_cavidade: cav.nome_cavidade,
              error: errorMsg
          });
      });
    }
    onProgress?.(Math.round(((i + 1) / totalItemsToUpload) * 100));
  }

  if (projectErrors.length === 0 && failedCavityDetails.length === 0) {
    console.log("[DB Controller] Consolidated upload fully successful.");
    return { success: true };
  } else {
    const overallErrorMessage = projectErrors.length > 0
      ? `Erros a nível de projeto: ${projectErrors.join("; \n")}`
      : `Algumas cavidades falharam no envio.`;
    console.error(
      "[DB Controller] Consolidated upload finished with errors.",
      { projectErrors, failedCavityDetails }
    );
    return {
      success: false,
      error: overallErrorMessage,
      failedCavities: failedCavityDetails,
    };
  }
};

export const updateTopography = async (
  registro_id: string,
  updatedData: Partial<TopographyData>
): Promise<void> => {
  try {
    const topographyCollection =
      database.collections.get<Topography>("topography");
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
  try {
    const project = await database.collections
      .get<Project>("project")
      .find(_id);
    const associatedCavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query(Q.where("projeto_id", _id))
      .fetch();

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
          .fetch();
        for (const cavity of associatedCavities) {
          await cavity.markAsDeleted();
          await cavity.destroyPermanently();
        }
        await project.markAsDeleted();
        await project.destroyPermanently();
      }
    });
    await deleteAllCavities();
    console.log("All projects and cavities deleted successfully!");
  } catch (error) {
    console.error("Error deleting all projects and cavities:", error);
  }
};

export const deleteTopography = async (registro_id: string): Promise<void> => {
  try {
    const topographyCollection =
      database.collections.get<Topography>("topography");
    const topography = await topographyCollection.find(registro_id);

    await database.write(async () => {
      await topography.markAsDeleted();
      await topography.destroyPermanently();
    });

    console.log("Topography deleted successfully!");
  } catch (error) {
    console.error("Error deleting topography:", error);
  }
};