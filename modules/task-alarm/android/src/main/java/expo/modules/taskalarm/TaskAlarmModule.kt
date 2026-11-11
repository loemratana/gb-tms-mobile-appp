package expo.modules.taskalarm

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** JS entry point: start / stop the full-screen task alarm, and check its permission. */
class TaskAlarmModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  override fun definition() = ModuleDefinition {
    Name("TaskAlarm")

    Function("ring") { title: String, body: String, taskId: String? ->
      AlarmService.start(context, AlarmPayload(title, body, taskId))
    }

    Function("stop") {
      AlarmService.stop(context)
    }

    Function("isRinging") {
      AlarmService.isRinging
    }

    /** Android 14+ lets users (and Play policy) revoke full-screen alarms; earlier versions always allow it. */
    Function("canUseFullScreenIntent") {
      if (Build.VERSION.SDK_INT < 34) return@Function true
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      manager.canUseFullScreenIntent()
    }

    Function("openFullScreenIntentSettings") {
      if (Build.VERSION.SDK_INT >= 34) {
        context.startActivity(
          Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT)
            .setData(Uri.parse("package:" + context.packageName))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
        )
      }
    }
  }
}
