#define BLINK_GPIO 2

unsigned pin_state = 0;

void blink(void)
{
  gpio_pad_select_gpio(BLINK_GPIO);
  gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);
  if (pin_state == 0) {
    pin_state = 1;
  } else {
    pin_state = 0;
  }
  gpio_set_level(BLINK_GPIO, pin_state);
}