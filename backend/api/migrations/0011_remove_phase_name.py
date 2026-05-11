from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_phase_match_phase'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='phase',
            name='name',
        ),
    ]
