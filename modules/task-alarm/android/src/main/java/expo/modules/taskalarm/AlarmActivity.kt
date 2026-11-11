package expo.modules.taskalarm

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.lang.ref.WeakReference
import java.text.DateFormat
import java.util.Date

/** Full-screen alarm shown over the lock screen: time, task, Dismiss and Open task. */
class AlarmActivity : Activity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    showOverLockScreen()
    current = WeakReference(this)
    render(AlarmPayload.fromIntent(intent))
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    render(AlarmPayload.fromIntent(intent))
  }

  override fun onDestroy() {
    if (current?.get() === this) current = null
    super.onDestroy()
  }

  /** Back shouldn't silently leave the alarm ringing behind the lock screen. */
  @Deprecated("Deprecated in Java")
  override fun onBackPressed() {
    dismiss()
  }

  private fun showOverLockScreen() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
      )
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
  }

  private fun render(alarm: AlarmPayload) {
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setBackgroundColor(Color.WHITE)
      setPadding(dp(28), dp(96), dp(28), dp(48))
    }

    root.addView(label("TASK REMINDER", 13f, BRAND_DARK, bold = true).apply { letterSpacing = 0.12f })
    root.addView(
      label(DateFormat.getTimeInstance(DateFormat.SHORT).format(Date()), 64f, TEXT, bold = true),
      marginTop(dp(12)),
    )
    root.addView(label(alarm.title, 24f, TEXT, bold = true), marginTop(dp(32)))
    if (alarm.body.isNotBlank()) {
      root.addView(label(alarm.body, 16f, MUTED), marginTop(dp(8)))
    }

    // Push the buttons to the bottom of the screen.
    root.addView(android.view.View(this), LinearLayout.LayoutParams(MATCH_PARENT, 0, 1f))

    if (alarm.taskId != null) {
      root.addView(
        button("Open task", BRAND, Color.WHITE) { openTask(alarm.taskId) },
        LinearLayout.LayoutParams(MATCH_PARENT, dp(56)),
      )
    }
    root.addView(
      button("Dismiss", Color.parseColor("#F3F4F6"), TEXT) { dismiss() },
      LinearLayout.LayoutParams(MATCH_PARENT, dp(56)).apply { topMargin = dp(12) },
    )

    setContentView(root)
  }

  private fun dismiss() {
    AlarmService.stop(this)
    finish()
  }

  private fun openTask(taskId: String) {
    AlarmService.stop(this)
    val keyguard = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && keyguard.isKeyguardLocked) {
      // Ask the user to unlock first, then open the task.
      keyguard.requestDismissKeyguard(this, object : KeyguardManager.KeyguardDismissCallback() {
        override fun onDismissSucceeded() = launchTask(taskId)
      })
    } else {
      launchTask(taskId)
    }
  }

  private fun launchTask(taskId: String) {
    startActivity(AlarmService.openTaskIntent(this, taskId))
    finish()
  }

  private fun label(text: String, sizeSp: Float, color: Int, bold: Boolean = false) = TextView(this).apply {
    this.text = text
    setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
    setTextColor(color)
    gravity = Gravity.CENTER
    if (bold) typeface = Typeface.DEFAULT_BOLD
  }

  private fun button(text: String, background: Int, textColor: Int, onClick: () -> Unit) = Button(this).apply {
    this.text = text
    isAllCaps = false
    setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
    setTextColor(textColor)
    typeface = Typeface.DEFAULT_BOLD
    stateListAnimator = null
    this.background = GradientDrawable().apply {
      setColor(background)
      cornerRadius = dp(14).toFloat()
    }
    setOnClickListener { onClick() }
  }

  private fun marginTop(px: Int) = LinearLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT).apply { topMargin = px }

  private fun dp(value: Int) = TypedValue.applyDimension(
    TypedValue.COMPLEX_UNIT_DIP,
    value.toFloat(),
    resources.displayMetrics,
  ).toInt()

  companion object {
    private val BRAND = Color.parseColor("#32CD32")
    private val BRAND_DARK = Color.parseColor("#16A34A")
    private val TEXT = Color.parseColor("#111827")
    private val MUTED = Color.parseColor("#6B7280")

    private var current: WeakReference<AlarmActivity>? = null

    fun intent(context: Context, alarm: AlarmPayload): Intent =
      Intent(context, AlarmActivity::class.java)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
        .also { alarm.writeTo(it) }

    /** Called when the alarm stops from elsewhere (notification action, timeout). */
    fun finishIfShowing() {
      current?.get()?.takeUnless { it.isFinishing }?.finish()
    }
  }
}
