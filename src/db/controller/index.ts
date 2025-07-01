import { convertYyyyMmDdToDdMmYyyy, formatDate } from "./../../util/index";
import { Q } from "@nozbe/watermelondb";
import {
  Cavidade,
  CavityRegisterData,
  ProjectModel,
  ProjectPayload,
  UserModel,
  TopographyData,
  UploadProjectPayload,
  BackendUploadResponse,
  ServerCavityData,
  UpdatableTopographyData,
} from "../../types";
import { database } from "../index";
import CavityRegister from "../model/cavityRegister";
import Project from "../model/project";
import User from "../model/user";
import { api } from "../../api";
import store from "../../redux/store";
import { setUserName } from "../../redux/userSlice";
import { convertDdMmYyyyToYyyyMmDd } from "../../util";
import uuid from "react-native-uuid";
import Topography from "../model/topography";
import TopographyDrawing from "../model/topography";

export interface FailedCavity {
  registro_id: string; // The original UUID or current DB ID
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
      if (jsonString === "{}" || jsonString === "[]") return undefined;
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn(`Error parsing ${fieldName}:`, e);
      return defaultVal;
    }
  }
  return defaultVal;
};

/**
 * Recursively removes 'outroEnabled' properties from an object for backend upload.
 * @param obj The object to clean.
 * @returns The cleaned object.
 */
function cleanObjectForUpload(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => cleanObjectForUpload(item));
  }

  const newObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === "outroEnabled") {
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
        cavity.cavidade_id = cavityData.registro_id;
        cavity.registro_id = cavityData.registro_id;
        cavity.projeto_id = cavityData.projeto_id;
        cavity.responsavel = cavityData.responsavel;
        cavity.nome_cavidade = cavityData.nome_cavidade;
        cavity.nome_sistema = cavityData.nome_sistema;
        // IMPORTANT: No date conversion here. `cavityData.data` is already in DD/MM/YYYY from form/redux.
        cavity.data = cavityData.data;
        cavity.municipio = cavityData.municipio;
        cavity.uf = cavityData.uf;
        cavity.localidade = cavityData.localidade;
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
        cavity.status = "pendente";
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
        let existingProject: Project | null = null;
        try {
          // PRIORITY 1: Find by the server's `register_id` (original UUID from app)
          const results = await projectCollection
            .query(Q.where("register_id", projectData.register_id))
            .fetch();
          if (results.length > 0) {
            existingProject = results[0];
          }
        } catch (e: any) {
          console.warn(
            `[createProjects] Error querying by register_id: ${e.message}`
          );
        }

        // FALLBACK 2: If not found by original UUID, try by WatermelonDB's internal `_raw.id`
        // (which would be projectData.id if it was already synced and updated local _raw.id)
        if (!existingProject) {
          try {
            existingProject = await projectCollection.find(
              String(projectData.id)
            );
            console.log(
              `[createProjects] Found project by _raw.id (matching server ID): ${projectData.id}`
            );
          } catch (e2) {
            // Not found by either. Will be created.
          }
        }

        if (existingProject) {
          await existingProject.update((project) => {
            project.register_id = projectData.register_id;
            project.projeto_id = String(projectData.register_id);
            project.nome_projeto = projectData.nome_projeto;
            project.inicio = projectData.inicio;
            project.descricao_projeto = projectData.descricao_projeto;
            project.status = projectData.status;
            project.uploaded = true;
          });
          console.log(
            `Project ${projectData.nome_projeto} (Local ID: ${existingProject.id} -> New Backend ID: ${projectData.id}) UPDATED.`
          );
        } else {
          console.log({ projectData });
          // If no existing project found, create a new one
          await projectCollection.create((project) => {
            project._raw.id = String(projectData.id);
            project.register_id = projectData.register_id;
            project.nome_projeto = projectData.nome_projeto;
            project.projeto_id = String(projectData.id);
            project.inicio = projectData.inicio;
            project.descricao_projeto = projectData.descricao_projeto;
            project.status = projectData.status;
            project.uploaded = true;
          });
          console.log(
            `Project ${projectData.nome_projeto} (New Backend ID: ${projectData.id}) CREATED.`
          );
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
        project._raw.id = String(projectData.register_id);
        project.register_id = String(projectData.register_id);
        project.projeto_id = String(projectData.register_id);
        project.nome_projeto = projectData.nome_projeto;
        project.inicio = projectData.inicio || new Date().toISOString();
        project.descricao_projeto = projectData.descricao_projeto;
        project.status = projectData.status || "Ativo";
        project.uploaded = false;
      });
    });
    console.log("Project created successfully!");
  } catch (error) {
    console.error("Error creating project:", error);
  }
};

export const createTopographyDrawing = async (
  drawingState: object,
  cavityId: string,
  isDraft: boolean
) => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );
    const newId = uuid.v4().toString();

    await database.write(async () => {
      console.log(JSON.stringify({}));
      const newDrawing = await drawingsCollection.create((drawing) => {
        drawing._raw.id = newId;
        drawing.topographyId = newId;
        drawing.cavity_id = cavityId;
        drawing.is_draft = isDraft;
        drawing.date = new Date().toISOString();
        drawing.drawing_data = JSON.stringify(drawingState);
        drawing.uploaded = false;
      });
      return newDrawing;
    });
    console.log("Desenho topográfico salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar o desenho topográfico:", error);
    throw error;
  }
};

export const createCavitiesFromServer = async (
  cavities: ServerCavityData[]
): Promise<void> => {
  try {
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");

    await database.write(async () => {
      for (const cavityData of cavities) {
        console.log(
          `\n[createCavitiesFromServer] Processing server cavity: ${cavityData.nome_cavidade} (Server ID: ${cavityData.id}, Server Reg ID: ${cavityData.registro_id})`
        );

        let existingCavity: CavityRegister | null = null;

        // Attempt 1: Find by original UUID (server's registro_id matches local registro_id)
        if (cavityData.registro_id) {
          try {
            const results = await cavityCollection
              .query(Q.where("registro_id", cavityData.registro_id))
              .fetch();
            if (results.length > 0) {
              existingCavity = results[0];
              console.log(
                `  Found by registro_id: Local Cavidade ID: ${existingCavity.cavidade_id}, Local Reg ID: ${existingCavity.registro_id}`
              );
            }
          } catch (e: any) {
            console.warn(
              `[createCavitiesFromServer] Error querying by registro_id for ${cavityData.registro_id}: ${e.message}`
            );
          }
        }

        // Attempt 2: If not found by original UUID, try by the current `cavidade_id` (which might be the backend ID if previously synced)
        if (!existingCavity) {
          try {
            const resultsById = await cavityCollection
              .query(Q.where("cavidade_id", String(cavityData.id)))
              .fetch();
            if (resultsById.length > 0) {
              existingCavity = resultsById[0];
              console.log(
                `  Found by cavidade_id (matching server ID): Local Cavidade ID: ${existingCavity.cavidade_id}, Local Reg ID: ${existingCavity.registro_id}`
              );
            } else {
              // If not found by cavidade_id, try by WatermelonDB's internal _raw.id if it happens to match the backend ID
              // This is less common but a final fallback if other lookups fail for some reason.
              try {
                const existingByRawId = await cavityCollection.find(
                  String(cavityData.id)
                );
                existingCavity = existingByRawId;
                console.log(
                  `  Found by _raw.id (matching server ID): Local Cavidade ID: ${existingCavity.cavidade_id}, Local Reg ID: ${existingCavity.registro_id}`
                );
              } catch (e3) {
                /* not found by _raw.id */
              }
            }
          } catch (e2: any) {
            console.warn(
              `[createCavitiesFromServer] Error querying by cavidade_id/find for ${cavityData.id}: ${e2.message}`
            );
          }
        }

        const entradasParsed = JSON.stringify(cavityData.entradas || []);
        const dificuldadesExternasParsed = JSON.stringify(
          cavityData.dificuldades_externas || {}
        );
        const aspectosSocioambientaisParsed = JSON.stringify(
          cavityData.aspectos_socioambientais || {}
        );
        const caracterizacaoInternaParsed = JSON.stringify(
          cavityData.caracterizacao_interna || {}
        );
        const topografiaParsed = JSON.stringify(cavityData.topografia || {});
        const morfologiaParsed = JSON.stringify(cavityData.morfologia || {});
        const hidrologiaParsed = JSON.stringify(cavityData.hidrologia || {});
        const sedimentosParsed = JSON.stringify(cavityData.sedimentos || {});
        const espeleotemasParsed = JSON.stringify(
          cavityData.espeleotemas || []
        );
        const biotaParsed = JSON.stringify(cavityData.biota || {});
        const arqueologiaParsed = JSON.stringify(cavityData.arqueologia || {});
        const paleontologiaParsed = JSON.stringify(
          cavityData.paleontologia || {}
        );

        if (existingCavity) {
          console.log(
            `  Updating existing cavity: ${existingCavity.nome_cavidade}`
          );
          await existingCavity.update((cav) => {
            cav._raw.id = String(cavityData.id);
            cav.cavidade_id = String(cavityData.id);
            cav.registro_id = cavityData.registro_id;

            cav.projeto_id = String(cavityData.projeto);
            cav.responsavel = cavityData.responsavel;
            cav.nome_cavidade = cavityData.nome_cavidade;
            cav.nome_sistema = cavityData.nome_sistema;
            cav.data = convertYyyyMmDdToDdMmYyyy(cavityData.data);
            cav.municipio = cavityData.municipio;
            cav.uf = cavityData.uf;
            cav.localidade = cavityData.localidade || undefined;
            cav.desenvolvimento_linear =
              cavityData.desenvolvimento_linear ?? undefined;
            cav.entradas = entradasParsed;
            cav.dificuldades_externas = dificuldadesExternasParsed;
            cav.aspectos_socioambientais = aspectosSocioambientaisParsed;
            cav.caracterizacao_interna = caracterizacaoInternaParsed;
            cav.topografia = topografiaParsed;
            cav.morfologia = morfologiaParsed;
            cav.hidrologia = hidrologiaParsed;
            cav.sedimentos = sedimentosParsed;
            cav.espeleotemas = espeleotemasParsed;
            cav.biota = biotaParsed;
            cav.arqueologia = arqueologiaParsed;
            cav.paleontologia = paleontologiaParsed;
            cav.uploaded = true;
            cav.status = cavityData.status || "sincronizado";
          });
          console.log(
            `[createCavitiesFromServer] Cavity ${cavityData.nome_cavidade} (Local Original Reg ID: ${cavityData.registro_id}, New Cavidade ID: ${cavityData.id}) UPDATED.`
          );
        } else {
          console.log(`  Creating new cavity: ${cavityData.nome_cavidade}`);
          await cavityCollection.create((cav) => {
            cav._raw.id = String(cavityData.id);
            cav.cavidade_id = String(cavityData.id);
            cav.registro_id = cavityData.registro_id;

            cav.projeto_id = String(cavityData.projeto);
            cav.responsavel = cavityData.responsavel;
            cav.nome_cavidade = cavityData.nome_cavidade;
            cav.nome_sistema = cavityData.nome_sistema;
            cav.data = convertYyyyMmDdToDdMmYyyy(cavityData.data);
            cav.municipio = cavityData.municipio;
            cav.uf = cavityData.uf;
            cav.localidade = cavityData.localidade || undefined;
            cav.desenvolvimento_linear =
              cavityData.desenvolvimento_linear ?? undefined;
            cav.entradas = entradasParsed;
            cav.dificuldades_externas = dificuldadesExternasParsed;
            cav.aspectos_socioambientais = aspectosSocioambientaisParsed;
            cav.caracterizacao_interna = caracterizacaoInternaParsed;
            cav.topografia = topografiaParsed;
            cav.morfologia = morfologiaParsed;
            cav.hidrologia = hidrologiaParsed;
            cav.sedimentos = sedimentosParsed;
            cav.espeleotemas = espeleotemasParsed;
            cav.biota = biotaParsed;
            cav.arqueologia = arqueologiaParsed;
            cav.paleontologia = paleontologiaParsed;
            cav.uploaded = true;
            cav.status = cavityData.status || "sincronizado";
          });
          console.log(
            `[createCavitiesFromServer] Cavity ${cavityData.nome_cavidade} (Backend Reg ID: ${cavityData.registro_id}, New Cavidade ID: ${cavityData.id}) CREATED.`
          );
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
        cavidade_id: cm.cavidade_id,
        registro_id: cm.registro_id,
        projeto_id: cm.projeto_id,
        responsavel: cm.responsavel,
        nome_cavidade: cm.nome_cavidade,
        nome_sistema: cm.nome_sistema,
        data: cm.data,
        municipio: cm.municipio,
        uf: cm.uf,
        localidade: cm.localidade,
        desenvolvimento_linear: cm.desenvolvimento_linear,
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
        espeleotemas: parseJsonField(cm.espeleotemas, "espeleotemas", []),
        biota: parseJsonField(cm.biota, "biota"),
        arqueologia: parseJsonField(cm.arqueologia, "arqueologia"),
        paleontologia: parseJsonField(cm.paleontologia, "paleontologia"),
        status: cm.status || "pendente",
        uploaded: cm.uploaded,
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

export const fetchPendingTopographyDrawings = async (): Promise<
  TopographyDrawing[]
> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );
    const pendingDrawings = await drawingsCollection
      .query(Q.where("uploaded", false))
      .fetch();
    return pendingDrawings;
  } catch (error) {
    console.error("Erro ao buscar desenhos de topografia pendentes:", error);
    return [];
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
      id: p.id,
      _id: p.id,
      projeto_id: p.projeto_id,
      register_id: p.register_id,
      status: p.status || "Ativo",
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

export const getProjectsWithPendingCavitiesCount =
  async (): Promise<number> => {
    try {
      // Step 1: Fetch all projects
      const allProjects = await database
        .get<Project>("project")
        .query()
        .fetch();

      // Step 2: Log their current state (including raw data) immediately after fetch
      console.log(
        "\n--- Projects fetched at start of getProjectsWithPendingCavitiesCount ---"
      );
      allProjects.forEach((p) => {
        console.log(
          `  Project ID: ${p._raw.id}, _raw.id: ${p._raw.id}, Model.uploaded: ${p.uploaded}, _raw.uploaded: ${p.uploaded}`
        );
      });
      console.log(
        "------------------------------------------------------------------"
      );

      // Step 3: Filter projects to find those truly needing upload (uploaded === false)
      const projectsNeedingUpload = allProjects.filter((p) =>
        isNaN(Number(p.projeto_id))
      );

      console.log("\n--- Projects filtered with uploaded === false ---");
      projectsNeedingUpload.forEach((p) => {
        console.log(
          `  Project ID: ${p._raw.id}, Name: ${p.nome_projeto}, Uploaded: ${p.uploaded}`
        );
      });
      console.log(
        `Total projects needing upload: ${projectsNeedingUpload.length}`
      );
      console.log("-----------------------------------------------");

      // Step 4: Fetch all cavities
      const allCavities = await database
        .get<CavityRegister>("cavity_register")
        .query()
        .fetch();

      // Step 5: Log their current state (including raw data) immediately after fetch
      console.log(
        "\n--- Cavities fetched at start of getProjectsWithPendingCavitiesCount ---"
      );
      allCavities.forEach((c) => {
        console.log(
          `  Cavity Reg ID: ${c.cavidade_id}, _raw.id: ${c._raw.id}, Model.uploaded: ${c.uploaded}, _raw.uploaded: ${c.uploaded}`
        );
      });
      console.log(
        "------------------------------------------------------------------"
      );

      // Step 6: Filter cavities to find those truly needing upload (uploaded === false)
      const cavitiesNeedingUpload = allCavities.filter((c) =>
        isNaN(Number(c.cavidade_id))
      );

      console.log("\n--- Cavities filtered with uploaded === false ---");
      cavitiesNeedingUpload.forEach((c) => {
        console.log(
          `  Cavity Reg ID: ${c.cavidade_id}, Name: ${c.nome_cavidade}, Uploaded: ${c.uploaded}`
        );
      });
      console.log(
        `Total cavities needing upload: ${cavitiesNeedingUpload.length}`
      );
      console.log("-----------------------------------------------");

      // Step 7: Determine if any pending items exist
      if (
        projectsNeedingUpload.length > 0 ||
        cavitiesNeedingUpload.length > 0
      ) {
        console.log(
          "\n[getProjectsWithPendingCavitiesCount] Result: 1 (Pending items found)"
        );
        return 1;
      }

      console.log(
        "\n[getProjectsWithPendingCavitiesCount] Result: 0 (No pending items found)"
      );
      return 0;
    } catch (error) {
      console.error("Error counting projects with pending items:", error);
      return 0;
    }
  };

export const fetchProjectsWithPendingCavities = async (
  projectIdToSync?: string
): Promise<UploadProjectPayload[]> => {
  try {
    const projectCollection = database.get<Project>("project");
    let projectsToProcess = await projectCollection.query().fetch();
    console.log({ projectsToProcess });
    if (projectIdToSync) {
      projectsToProcess = projectsToProcess.filter(
        (p) => p.projeto_id === projectIdToSync && isNaN(Number(p.projeto_id))
      );
      if (projectsToProcess.length === 0) return [];
    }

    const projectsToSyncAggregated: UploadProjectPayload[] = [];

    for (const project of projectsToProcess) {
      console.log({ row: project });
      const allCavities = await database
        .get<CavityRegister>("cavity_register")
        .query(Q.where("projeto_id", project.projeto_id))
        .fetch();
      console.log({ allCavities });
      const pendingCavitiesModels = allCavities.filter((c) =>
        isNaN(Number(c.cavidade_id))
      );
      console.log({ pendingCavitiesModels });
      if (pendingCavitiesModels.length > 0) {
        console.log(520);
        const cavitiesPayload: Omit<Cavidade, "projeto_id">[] =
          pendingCavitiesModels.map(
            (cm: CavityRegister): Omit<Cavidade, "projeto_id"> => {
              const cavityData: Cavidade = {
                cavidade_id: cm.cavidade_id,
                registro_id: cm.registro_id,
                projeto_id: cm.projeto_id,
                responsavel: cm.responsavel,
                nome_cavidade: cm.nome_cavidade,
                nome_sistema: cm.nome_sistema,
                data: convertDdMmYyyyToYyyyMmDd(cm.data),
                municipio: cm.municipio,
                uf: cm.uf,
                localidade: cm.localidade || undefined,
                desenvolvimento_linear:
                  cm.desenvolvimento_linear === null
                    ? undefined
                    : cm.desenvolvimento_linear,
                entradas: parseJsonField(
                  cm.entradas,
                  `entradas for ${cm.registro_id}`,
                  []
                ),
                dificuldades_externas: parseJsonField(
                  cm.dificuldades_externas,
                  `dificuldades_externas for ${cm.registro_id}`
                ),
                aspectos_socioambientais: parseJsonField(
                  cm.aspectos_socioambientais,
                  `asp_socio for ${cm.registro_id}`
                ),
                caracterizacao_interna: parseJsonField(
                  cm.caracterizacao_interna,
                  `carac_interna for ${cm.registro_id}`
                ),
                topografia: parseJsonField(
                  cm.topografia,
                  `topografia for ${cm.registro_id}`
                ),
                morfologia: parseJsonField(
                  cm.morfologia,
                  `morfologia for ${cm.registro_id}`
                ),
                hidrologia: parseJsonField(
                  cm.hidrologia,
                  `hidrologia for ${cm.registro_id}`
                ),
                sedimentos: parseJsonField(
                  cm.sedimentos,
                  `sedimentos for ${cm.registro_id}`
                ),
                espeleotemas: parseJsonField(
                  cm.espeleotemas,
                  `espeleotemas for ${cm.registro_id}`,
                  []
                ),
                biota: parseJsonField(cm.biota, `biota for ${cm.registro_id}`),
                arqueologia: parseJsonField(
                  cm.arqueologia,
                  `arqueologia for ${cm.registro_id}`
                ),
                paleontologia: parseJsonField(
                  cm.paleontologia,
                  `paleontologia for ${cm.registro_id}`
                ),
                status: cm.status || "pendente",
              };

              const { projeto_id, ...cavityPayloadWithoutProjectId } =
                cavityData;
              return cavityPayloadWithoutProjectId;
            }
          );

        projectsToSyncAggregated.push({
          _id: project._raw.id,
          projeto_id: project.projeto_id,
          register_id: project.register_id,
          nome_projeto: project.nome_projeto,
          inicio: project.inicio,
          descricao_projeto: project.descricao_projeto,
          status: "Ativo",
          cavities: cavitiesPayload,
        });
      }
    }
    return projectsToSyncAggregated;
  } catch (error) {
    console.error("Error fetching projects with pending items data:", error);
    throw error;
  }
};

export const fetchTopographyDrawingById = async (
  drawingId: string
): Promise<TopographyDrawing | null> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );
    const drawing = await drawingsCollection.find(drawingId);
    return drawing;
  } catch (error) {
    console.error("Desenho não encontrado ou erro ao buscar:", error);
    return null;
  }
};

export const fetchAllTopographyDrawingsWithCavity = async (): Promise<
  { drawing: TopographyDrawing; cavityName: string }[]
> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );
    const allDrawings = await drawingsCollection.query().fetch();

    const enrichedDrawings = await Promise.all(
      allDrawings.map(async (drawing) => {
        let cavityName = "Cavidade não encontrada";
        try {
          // --- MUDANÇA PRINCIPAL AQUI ---
          const cavityQuery = database
            .get<CavityRegister>("cavity_register")
            .query(Q.where("cavidade_id", drawing.cavity_id));
          const cavities = await cavityQuery.fetch();

          if (cavities.length > 0) {
            const cavity = cavities[0]; // Pegamos o primeiro resultado
            cavityName =
              cavity.nome_cavidade || `Cavidade ${cavity.id.substring(0, 5)}`;
          } else {
            console.warn(
              `Nenhuma cavidade encontrada com cavidade_id: ${drawing.cavity_id}`
            );
          }
        } catch (error) {
          console.warn(
            `Erro ao procurar a cavidade com ID: ${drawing.cavity_id}`,
            error
          );
        }
        console.log(drawing.drawing_data);
        return { drawing, cavityName };
      })
    );

    return enrichedDrawings;
  } catch (error) {
    console.error(
      "Erro ao buscar todos os desenhos com nomes de cavidades:",
      error
    );
    return [];
  }
};

// UPDATE

export const updateCavity = async (
  cavidade_id: string, // Changed from registro_id to cavidade_id for lookup
  updatedData: Partial<Omit<CavityRegisterData, "registro_id">>
): Promise<void> => {
  try {
    console.log({ cavidade_id, updatedData });
    const cavityCollection =
      database.collections.get<CavityRegister>("cavity_register");
    // Find cavity by its current cavidade_id
    const cavities = await cavityCollection
      .query(Q.where("cavidade_id", cavidade_id))
      .fetch();

    if (cavities.length === 0) {
      console.warn(
        `Cavity with cavidade_id ${cavidade_id} not found for update.`
      );
      return;
    }
    const cavity = cavities[0];

    await database.write(async () => {
      await cavity.update((cav) => {
        // Only update if the new data is provided\
        if (updatedData.cavidade_id !== undefined) {
          cav.cavidade_id = updatedData.cavidade_id;
        }
        if (updatedData.projeto_id !== undefined)
          cav.projeto_id = updatedData.projeto_id;
        if (updatedData.responsavel !== undefined)
          cav.responsavel = updatedData.responsavel;
        if (updatedData.nome_cavidade !== undefined)
          cav.nome_cavidade = updatedData.nome_cavidade;
        if (updatedData.nome_sistema !== undefined)
          cav.nome_sistema = updatedData.nome_sistema;
        if (updatedData.data !== undefined) cav.data = updatedData.data;
        if (updatedData.municipio !== undefined)
          cav.municipio = updatedData.municipio;
        if (updatedData.uf !== undefined) cav.uf = updatedData.uf;
        if (updatedData.localidade !== undefined)
          cav.localidade = updatedData.localidade;
        if (updatedData.entradas !== undefined)
          cav.entradas = updatedData.entradas;
        if (updatedData.desenvolvimento_linear !== undefined)
          cav.desenvolvimento_linear =
            updatedData.desenvolvimento_linear || undefined;
        if (updatedData.dificuldades_externas !== undefined)
          cav.dificuldades_externas = updatedData.dificuldades_externas;
        if (updatedData.aspectos_socioambientais !== undefined)
          cav.aspectos_socioambientais = updatedData.aspectos_socioambientais;
        if (updatedData.caracterizacao_interna !== undefined)
          cav.caracterizacao_interna = updatedData.caracterizacao_interna;
        if (updatedData.topografia !== undefined)
          cav.topografia = updatedData.topografia;
        if (updatedData.morfologia !== undefined)
          cav.morfologia = updatedData.morfologia;
        if (updatedData.hidrologia !== undefined)
          cav.hidrologia = updatedData.hidrologia;
        if (updatedData.sedimentos !== undefined)
          cav.sedimentos = updatedData.sedimentos;
        if (updatedData.espeleotemas !== undefined)
          cav.espeleotemas = updatedData.espeleotemas;
        if (updatedData.biota !== undefined) cav.biota = updatedData.biota;
        if (updatedData.arqueologia !== undefined)
          cav.arqueologia = updatedData.arqueologia;
        if (updatedData.paleontologia !== undefined)
          cav.paleontologia = updatedData.paleontologia;
        if (updatedData.uploaded !== undefined)
          cav.uploaded = updatedData.uploaded;
      });
    });

    console.log("Cavity updated successfully!");
  } catch (error) {
    console.error("Error updating cavity:", error);
    throw error;
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
    console.log({ project_id, updatedData });
    const projectCollection = database.collections.get<Project>("project");
    const project = await projectCollection.find(project_id);

    await database.write(async () => {
      await project.update((proj) => {
        if (updatedData.id !== undefined)
          proj.projeto_id = String(updatedData.id);
        proj.nome_projeto = updatedData.nome_projeto || proj.nome_projeto;
        proj.inicio = updatedData.inicio || proj.inicio;
        proj.descricao_projeto =
          updatedData.descricao_projeto || proj.descricao_projeto;
        if (updatedData.uploaded !== undefined)
          proj.uploaded = updatedData.uploaded;
      });
    });

    console.log("Project updated successfully!");
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

export const updateTopographyCavityId = async (
  oldCavityId: string,
  newCavityId: string
): Promise<void> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );

    const drawingsToUpdate = await drawingsCollection
      .query(Q.where("cavity_id", oldCavityId))
      .fetch();

    if (drawingsToUpdate.length > 0) {
      const drawing = drawingsToUpdate[0];

      await database.write(async () => {
        await drawing.update((d) => {
          d.cavity_id = newCavityId;
        });
      });
      console.log(
        `[Controller] O cavity_id do desenho foi atualizado de ${oldCavityId} para ${newCavityId}`
      );
    }
  } catch (error) {
    console.error(
      `Erro ao atualizar o cavity_id da topografia para o ID antigo ${oldCavityId}:`,
      error
    );
  }
};

export const syncConsolidatedUpload = async (
  projectsToSync: UploadProjectPayload[],
  onProgress?: (progress: number) => void
): Promise<{
  success: boolean;
  error?: string;
  failedCavities?: FailedCavity[];
}> => {
  if (!projectsToSync || projectsToSync.length === 0) {
    onProgress?.(100);
    console.log("[DB Controller] No project packages to sync.");
    return { success: true, failedCavities: [] };
  }

  const totalItemsToUpload = projectsToSync.length;
  const projectErrors: string[] = [];
  const failedCavityDetails: FailedCavity[] = [];

  for (let i = 0; i < projectsToSync.length; i++) {
    const projectPackage = projectsToSync[i];
    let newProjectBackendId: string | undefined;

    try {
      console.log(
        `[DB Controller] Attempting to sync package for project: ${projectPackage.nome_projeto} (Local Register ID: ${projectPackage.register_id}) with ${projectPackage.cavities.length} cavities.`
      );
      const users = await fetchAllUsers();
      if (!users.length) throw new Error("Usuário não autenticado.");
      const user = users[0];

      const cleanedProjectPackage = cleanObjectForUpload(projectPackage);

      const payloadToSend = {
        _id: cleanedProjectPackage.register_id,
        nome_projeto: cleanedProjectPackage.nome_projeto,
        descricao_projeto: cleanedProjectPackage.descricao_projeto,
        status: cleanedProjectPackage.status,
        cavities: cleanedProjectPackage.cavities,
      };

      const response = await api.post<BackendUploadResponse>(
        "/projetos/app_upload/",
        payloadToSend,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const responseData = response.data;

      if (response.status >= 200 && response.status < 300) {
        if (responseData.detail || responseData.message) {
          const overallMessage =
            typeof responseData.detail === "string"
              ? responseData.detail
              : JSON.stringify(responseData.detail || responseData.message);
          projectErrors.push(
            `Projeto ${projectPackage.nome_projeto}: ${overallMessage}`
          );
        }

        // --- ATUALIZAÇÃO DO PROJETO ---
        const localProject = await database
          .get<Project>("project")
          .find(projectPackage._id);
        if (localProject) {
          const projectUpdateData: Partial<ProjectPayload> = { uploaded: true };
          if (responseData.projeto?.id) {
            newProjectBackendId = String(responseData.projeto.id);
            projectUpdateData.id = newProjectBackendId;
          }
          await updateProject(localProject.id, projectUpdateData);
        }

        // --- ATUALIZAÇÃO DAS CAVIDADES ---
        for (const originalCavityInPayload of projectPackage.cavities) {
          const localCavities = await database
            .get<CavityRegister>("cavity_register")
            .query(Q.where("registro_id", originalCavityInPayload.registro_id))
            .fetch();

          if (localCavities.length > 0) {
            const localCavity = localCavities[0];
            const oldCavityIdForLookup = localCavity.cavidade_id; // Guarda o ID antigo ANTES de atualizar

            const backendSuccessCavity = responseData.cavities.find(
              (bc) => bc.registro_id === originalCavityInPayload.registro_id
            );
            const backendFailedCavity = responseData.cavities_errors.find(
              (fc) => fc.registro_id === originalCavityInPayload.registro_id
            );

            const cavityUpdateData: Partial<
              Omit<CavityRegisterData, "registro_id">
            > = {};
            if (newProjectBackendId) {
              cavityUpdateData.projeto_id = newProjectBackendId;
            }

            if (backendSuccessCavity) {
              cavityUpdateData.cavidade_id = String(backendSuccessCavity.id);
              cavityUpdateData.uploaded = true;
            } else if (backendFailedCavity) {
              if (
                !failedCavityDetails.some(
                  (f) => f.registro_id === originalCavityInPayload.registro_id
                )
              ) {
                failedCavityDetails.push({
                  registro_id: originalCavityInPayload.registro_id,
                  nome_cavidade: originalCavityInPayload.nome_cavidade,
                  error:
                    typeof backendFailedCavity.error === "string"
                      ? backendFailedCavity.error
                      : JSON.stringify(backendFailedCavity.error),
                });
              }
            }

            // 1. Atualiza a própria cavidade
            await updateCavity(oldCavityIdForLookup, cavityUpdateData);

            // --- LÓGICA DE ATUALIZAÇÃO DA TOPOGRAFIA ADICIONADA AQUI ---
            // 2. Se a cavidade foi atualizada com sucesso, atualiza o desenho de topografia correspondente
            if (backendSuccessCavity) {
              await updateTopographyCavityId(
                oldCavityIdForLookup,
                String(backendSuccessCavity.id)
              );
            }
          }
        }
      } else {
        const errorDetails =
          typeof responseData.detail === "string"
            ? responseData.detail
            : JSON.stringify(
                responseData.detail ||
                  responseData.message ||
                  "Erro desconhecido da API"
              );
        projectErrors.push(
          `Projeto ${projectPackage.nome_projeto}: Falha no envio (status ${response.status} - ${errorDetails})`
        );
        projectPackage.cavities.forEach((cav) => {
          failedCavityDetails.push({
            registro_id: cav.registro_id,
            nome_cavidade: cav.nome_cavidade,
            error: `Falha no envio do projeto: ${errorDetails}`,
          });
        });
      }
    } catch (error: any) {
      let detailedErrorMessage =
        error.response?.data?.detail || error.response?.data?.message;
      if (!detailedErrorMessage) {
        detailedErrorMessage =
          typeof error.message === "string"
            ? error.message
            : JSON.stringify(error.message || error);
      }
      const errorMsg = `Projeto ${projectPackage.nome_projeto}: ${
        detailedErrorMessage || "Erro desconhecido"
      }`;
      projectErrors.push(errorMsg);
      projectPackage.cavities.forEach((cav) => {
        failedCavityDetails.push({
          registro_id: cav.registro_id,
          nome_cavidade: cav.nome_cavidade,
          error: errorMsg,
        });
      });
    }
    onProgress?.(Math.round(((i + 1) / totalItemsToUpload) * 100));
  }

  const overallSuccess =
    projectErrors.length === 0 && failedCavityDetails.length === 0;
  return {
    success: overallSuccess,
    error: overallSuccess
      ? undefined
      : `Algumas cavidades e/ou projetos falharam no envio.`,
    failedCavities: failedCavityDetails,
  };
};

export const syncTopographyDrawings = async (
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; error?: string }> => {
  // 1. Busca os desenhos pendentes
  const pendingDrawings = await fetchPendingTopographyDrawings();

  if (pendingDrawings.length === 0) {
    console.log("[Sync Topography] Nenhum desenho para enviar.");
    onProgress?.(100);
    return { success: true };
  }

  // 2. Busca o token do usuário
  const users = await fetchAllUsers();
  if (!users.length) {
    return { success: false, error: "Usuário não autenticado." };
  }
  const user = users[0];
  const headers = { Authorization: `Bearer ${user.token}` };

  const totalItems = pendingDrawings.length;
  let errors: string[] = [];

  // 3. Itera sobre cada desenho e tenta fazer o upload
  for (let i = 0; i < totalItems; i++) {
    const drawing = pendingDrawings[i];
    try {
      // Prepara o payload para enviar para a API
      const payload = {
        local_id: drawing.id, // ID interno do WatermelonDB
        topography_id: drawing.topographyId, // ID que pode mudar após o sync
        cavity_id: drawing.cavity_id,
        is_draft: drawing.is_draft,
        date: drawing.date,
        drawing_data: JSON.parse(drawing.drawing_data), // Envia o JSON como objeto
      };

      // --- SUBSTITUA O ENDPOINT AQUI ---
      const YOUR_ENDPOINT = "/topography/app_upload/"; // <-- COLOQUE SEU ENDPOINT AQUI

      const response = await api.post(YOUR_ENDPOINT, payload, { headers });

      // 4. Se o upload for bem-sucedido, atualiza o registro local
      if (response.status >= 200 && response.status < 300) {
        const backendResponse = response.data; // ex: { id: 'novo-id-do-servidor', ... }

        await updateTopography(drawing.id, {
          uploaded: true,
          topography_id: backendResponse.id, // Atualiza com o ID retornado pelo servidor
        });
      } else {
        throw new Error(`Status ${response.status}: ${response.data}`);
      }
    } catch (error: any) {
      console.error(`Erro ao enviar o desenho ${drawing.id}:`, error);
      errors.push(`Desenho para cavidade ${drawing.cavity_id} falhou.`);
    }
    onProgress?.(Math.round(((i + 1) / totalItems) * 100));
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join("\n") };
  }

  return { success: true };
};

export const updateTopography = async (
  drawingId: string, // Usando o ID do WatermelonDB (_raw.id)
  updatedData: Partial<UpdatableTopographyData> // Permite passar apenas os campos a serem alterados
): Promise<void> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );

    const topographyToUpdate = await drawingsCollection.find(drawingId);

    await database.write(async () => {
      await topographyToUpdate.update((topo) => {
        Object.assign(topo, updatedData);
      });
    });

    console.log("Topografia atualizada com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar a Topografia:", error);
    throw error;
  }
};

// DELETE
export const deleteCavity = async (cavidade_id: string): Promise<void> => {
  // Use cavidade_id for lookup
  try {
    const cavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query(Q.where("cavidade_id", cavidade_id)) // Query by cavidade_id
      .fetch();
    if (cavities.length > 0) {
      await database.write(async () => {
        await cavities[0].destroyPermanently(); // Correctly destroys
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

    if (allCavities.length === 0) {
      console.log("No cavities to delete.");
      return;
    }

    const deletions = allCavities.map((cavity) =>
      cavity.prepareDestroyPermanently()
    );

    await database.write(async () => {
      await database.batch(...deletions);
    });

    console.log(`All ${allCavities.length} cavities deleted successfully!`);
  } catch (error) {
    console.error("Error deleting all cavities:", error);
  }
};

export const deleteUser = async (user_id: string): Promise<void> => {
  try {
    const user = await database.collections.get<User>("user").find(user_id);
    await database.write(async () => {
      await user.destroyPermanently(); // Correctly destroys
    });
    console.log("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const project = await database.collections
      .get<Project>("project")
      .find(projectId);

    const associatedCavities = await database.collections
      .get<CavityRegister>("cavity_register")
      .query(Q.where("projeto_id", project.id))
      .fetch();

    await database.write(async () => {
      const allDeletions: any[] = [];
      associatedCavities.forEach((cavity) => {
        allDeletions.push(cavity.prepareDestroyPermanently());
      });
      allDeletions.push(project.prepareDestroyPermanently());

      if (allDeletions.length > 0) {
        await database.batch(...allDeletions);
      }
    });
    console.log(
      `Project and associated cavities for project ${projectId} deleted successfully!`
    );
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
      const allDeletions: any[] = [];

      for (const project of allProjects) {
        console.log(
          `[deleteAllProjects] Preparing to delete project: ${project.nome_projeto} (ID: ${project.id})`
        );

        const associatedCavities = await database.collections
          .get<CavityRegister>("cavity_register")
          .query(Q.where("projeto_id", project.id))
          .fetch();

        associatedCavities.forEach((cavity) => {
          console.log(
            `  Preparing to delete associated cavity: ${cavity.nome_cavidade} (ID: ${cavity.cavidade_id})`
          );
          allDeletions.push(cavity.prepareDestroyPermanently());
        });

        allDeletions.push(project.prepareDestroyPermanently());
      }

      if (allDeletions.length > 0) {
        await database.batch(...allDeletions);
        console.log(
          `Successfully deleted ${allDeletions.length} records (projects and associated cavities)!`
        );
      } else {
        console.log("No projects or associated cavities found to delete.");
      }
    });
  } catch (error) {
    console.error("Error deleting all projects and cavities:", error);
    throw error;
  }
};

export const deleteTopography = async (registro_id: string): Promise<void> => {
  try {
    const drawingsCollection = database.get<TopographyDrawing>(
      "topography_drawings"
    );
    const topography = await drawingsCollection.find(registro_id);

    await database.write(async () => {
      await topography.destroyPermanently();
    });

    console.log("Topography deleted successfully!");
  } catch (error) {
    console.error("Error deleting topography:", error);
  }
};

export const deleteAllTopographies = async (): Promise<void> => {
  try {
    const allTopographies = await database.collections
      .get<TopographyDrawing>("topography_drawings")
      .query()
      .fetch();

    if (allTopographies.length === 0) {
      console.log("No topographies to delete.");
      return;
    }

    const deletions = allTopographies.map((topography) =>
      topography.prepareDestroyPermanently()
    );

    await database.write(async () => {
      await database.batch(...deletions);
    });

    console.log(
      `All ${allTopographies.length} topography deleted successfully!`
    );
  } catch (error) {
    console.error("Error deleting all topography:", error);
  }
};
