import { NativeModule } from "expo";
import type { AlarmPermissionResponse, AlarmAction, AlarmContext, AlarmOccurrence, AlarmOccurrenceResolution, AlarmOccurrenceResolutionResult, AlarmScheduleInput, AlarmSchedulerModuleEvents, NativeAlarmBackupResult, NativeAlarmDebugState, ScheduledAlarm } from "./AlarmScheduler.types";
declare class AlarmSchedulerModule extends NativeModule<AlarmSchedulerModuleEvents> {
    getPermissionsAsync(): Promise<AlarmPermissionResponse>;
    requestPermissionsAsync(): Promise<AlarmPermissionResponse>;
    openAlarmSettingsAsync(): Promise<boolean>;
    openFullScreenIntentSettingsAsync(): Promise<boolean>;
    scheduleAlarmAsync(_alarm: AlarmScheduleInput): Promise<ScheduledAlarm>;
    cancelAlarmAsync(_id: string): Promise<boolean>;
    getScheduledAlarmsAsync(): Promise<ScheduledAlarm[]>;
    getCurrentAlarmContextAsync(): Promise<AlarmContext | null>;
    getPendingAlarmActionsAsync(): Promise<AlarmAction[]>;
    clearPendingAlarmActionsAsync(_ids?: string[]): Promise<void>;
    getPendingNativeAlarmHandoffAsync(): Promise<AlarmAction | null>;
    clearPendingNativeAlarmHandoffAsync(): Promise<void>;
    completeNativeAlarmAsync(_alarmId: string): Promise<void>;
    resolveAlarmOccurrenceAsync(occurrenceId: string, resolution: AlarmOccurrenceResolution): Promise<AlarmOccurrenceResolutionResult>;
    getAlarmOccurrencesAsync(_alarmId?: string): Promise<AlarmOccurrence[]>;
    cancelAlarmOccurrenceAsync(_occurrenceId: string): Promise<boolean>;
    scheduleNativeAlarmBackupAsync(alarmId: string, delaySeconds?: number): Promise<NativeAlarmBackupResult>;
    cancelNativeAlarmBackupAsync(_alarmId: string): Promise<boolean>;
    clearBypassAsync(_alarmId: string): Promise<void>;
    resetNativeAlarmCompletionAsync(_alarmId: string): Promise<void>;
    getNativeAlarmDebugStateAsync(alarmId: string): Promise<NativeAlarmDebugState>;
    setSystemAlarmAsync(_alarm: AlarmScheduleInput): Promise<boolean>;
    openSystemAlarmAppAsync(): Promise<boolean>;
    private unavailablePermission;
}
export declare const AlarmScheduler: typeof AlarmSchedulerModule;
export default AlarmScheduler;
//# sourceMappingURL=AlarmSchedulerModule.web.d.ts.map