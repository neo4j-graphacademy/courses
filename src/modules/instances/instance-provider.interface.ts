import { EagerResult, QueryResult, RoutingControl } from "neo4j-driver";
import { Instance } from "../../domain/model/instance";
import { User } from "../../domain/model/user";

export interface InstanceProvider {
  getInstanceForUseCase(token: string, user: User, usecase: string): Promise<Instance | undefined>;
  getInstanceById(token: string, user: User, hash: string): Promise<{ instance: Instance | undefined; status: string }>;
  getInstances(token: string, user: User): Promise<Instance[]>;
  stopInstance(token: string, user: User, instanceHashKey: string): Promise<void>;
  createInstance(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance>;
  getOrCreateInstanceForUseCase(token: string, user: User, usecase: string, vectorOptimized: boolean, graphAnalyticsPlugin: boolean): Promise<Instance>;
  async executeCypher<T = Record<string, any>>(token: string, user: User, usecase: string, cypher: string, params: Record<string, any>, routing: RoutingControl): Promise<EagerResult<T> | undefined> {
}
