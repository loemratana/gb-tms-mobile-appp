package expo.modules.taskalarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat

/**
 * Rings a task reminder like an alarm clock: loops `res/raw/alarm` on the alarm
 * stream, vibrates, and keeps a full-screen notification (→ [AlarmActivity]) up
 * until the user dismisses it or [AUTO_STOP_MS] passes.
 */
class AlarmService : Service() {

  private var player: MediaPlayer? = null
  private var vibrator: Vibrator? = null
  private var wakeLock: PowerManager.WakeLock? = null
  private val handler = Handler(Looper.getMainLooper())
  private val autoStop = Runnable { stopAlarm() }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopAlarm()
      return START_NOT_STICKY
    }

    val alarm = AlarmPayload.fromIntent(intent)
    startInForeground(alarm)
    startSoundAndVibration()

    handler.removeCallbacks(autoStop)
    handler.postDelayed(autoStop, AUTO_STOP_MS)
    isRinging = true
    return START_NOT_STICKY
  }

  private fun startInForeground(alarm: AlarmPayload) {
    ensureChannel(this)

    val fullScreen = PendingIntent.getActivity(
      this,
      REQUEST_FULL_SCREEN,
      AlarmActivity.intent(this, alarm),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val dismiss = PendingIntent.getService(
      this,
      REQUEST_DISMISS,
      Intent(this, AlarmService::class.java).setAction(ACTION_STOP),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val openTask = PendingIntent.getActivity(
      this,
      REQUEST_OPEN,
      openTaskIntent(this, alarm.taskId),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    val notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(notificationIcon(this))
      .setContentTitle(alarm.title)
      .setContentText(alarm.body)
      .setStyle(NotificationCompat.BigTextStyle().bigText(alarm.body))
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setAutoCancel(false)
      .setContentIntent(fullScreen)
      .setFullScreenIntent(fullScreen, true)
      .addAction(0, "Dismiss", dismiss)
      .addAction(0, "Open task", openTask)
      .build()
    notification.flags = notification.flags or Notification.FLAG_INSISTENT

    ServiceCompat.startForeground(
      this,
      NOTIFICATION_ID,
      notification,
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
      } else {
        0
      },
    )
  }

  private fun startSoundAndVibration() {
    releasePlayback()

    val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
    wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "TaskAlarm:ring").apply {
      acquire(AUTO_STOP_MS + 10_000)
    }

    val soundId = resources.getIdentifier("alarm", "raw", packageName)
    if (soundId != 0) {
      player = MediaPlayer().apply {
        setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build(),
        )
        setDataSource(this@AlarmService, Uri.parse("android.resource://$packageName/$soundId"))
        isLooping = true
        prepare()
        start()
      }
    }

    vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
    } else {
      @Suppress("DEPRECATION")
      getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    }
    vibrator?.vibrate(VibrationEffect.createWaveform(VIBRATION_PATTERN, 0))
  }

  private fun releasePlayback() {
    player?.run {
      runCatching { stop() }
      release()
    }
    player = null
    vibrator?.cancel()
    vibrator = null
    wakeLock?.takeIf { it.isHeld }?.release()
    wakeLock = null
  }

  private fun stopAlarm() {
    handler.removeCallbacks(autoStop)
    releasePlayback()
    isRinging = false
    AlarmActivity.finishIfShowing()
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    handler.removeCallbacks(autoStop)
    releasePlayback()
    isRinging = false
    super.onDestroy()
  }

  companion object {
    const val ACTION_RING = "expo.modules.taskalarm.RING"
    const val ACTION_STOP = "expo.modules.taskalarm.STOP"
    /** Separate from the app's other channels; bump the suffix if its settings change. */
    const val CHANNEL_ID = "task-alarm-v1"
    private const val NOTIFICATION_ID = 7341
    private const val REQUEST_FULL_SCREEN = 1
    private const val REQUEST_DISMISS = 2
    private const val REQUEST_OPEN = 3
    private const val AUTO_STOP_MS = 5 * 60 * 1000L
    private val VIBRATION_PATTERN = longArrayOf(0, 800, 600)

    @Volatile
    var isRinging: Boolean = false
      private set

    fun start(context: Context, alarm: AlarmPayload) {
      val intent = Intent(context, AlarmService::class.java).setAction(ACTION_RING)
      alarm.writeTo(intent)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      if (!isRinging) return
      context.startService(Intent(context, AlarmService::class.java).setAction(ACTION_STOP))
    }

    /** The service plays the sound itself, so the channel is silent; it exists for the full-screen intent. */
    fun ensureChannel(context: Context) {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      if (manager.getNotificationChannel(CHANNEL_ID) != null) return
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "Task alarms", NotificationManager.IMPORTANCE_HIGH).apply {
          description = "Full-screen alarm when a task reminder is due"
          setSound(null, null)
          enableVibration(false)
          lockscreenVisibility = Notification.VISIBILITY_PUBLIC
          setBypassDnd(true)
        },
      )
    }

    /** Deep link handled by the app's `reminder` route, which opens the task for the user's role. */
    fun openTaskIntent(context: Context, taskId: String?): Intent {
      val uri = Uri.parse("tmsmobileapp://reminder" + (taskId?.let { "?taskId=" + Uri.encode(it) } ?: ""))
      return Intent(Intent.ACTION_VIEW, uri)
        .setPackage(context.packageName)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }

    private fun notificationIcon(context: Context): Int {
      val id = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
      return if (id != 0) id else context.applicationInfo.icon
    }
  }
}

/** What the alarm shows. Travels between the module, service and activity as intent extras. */
data class AlarmPayload(val title: String, val body: String, val taskId: String?) {
  fun writeTo(intent: Intent) {
    intent.putExtra(EXTRA_TITLE, title)
    intent.putExtra(EXTRA_BODY, body)
    intent.putExtra(EXTRA_TASK_ID, taskId)
  }

  companion object {
    private const val EXTRA_TITLE = "title"
    private const val EXTRA_BODY = "body"
    private const val EXTRA_TASK_ID = "taskId"

    fun fromIntent(intent: Intent?): AlarmPayload = AlarmPayload(
      title = intent?.getStringExtra(EXTRA_TITLE) ?: "Task reminder",
      body = intent?.getStringExtra(EXTRA_BODY) ?: "",
      taskId = intent?.getStringExtra(EXTRA_TASK_ID),
    )
  }
}
