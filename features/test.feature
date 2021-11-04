Feature: Test

  Scenario: Test
    Then test

  # published message is received
  # published message only received by one consumer
  # unacked message reprocessed when message handler restarts
  # handled message is not read again
  # unacked message claimed when unresponsive message handler takes too long
  # published message not sent when paused
  # published message sent when unpaused

