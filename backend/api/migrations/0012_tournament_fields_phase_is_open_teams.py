from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_remove_phase_name'),
    ]

    operations = [
        # Tournament new fields
        migrations.AddField(
            model_name='tournament',
            name='started',
            field=models.DateField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='tournament',
            name='type',
            field=models.CharField(
                max_length=20,
                choices=[('knockout', 'Knockout'), ('league', 'League')],
                default='league',
            ),
        ),
        migrations.AddField(
            model_name='tournament',
            name='active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='tournament',
            name='visibility',
            field=models.CharField(
                max_length=10,
                choices=[('public', 'Public'), ('private', 'Private')],
                default='public',
            ),
        ),
        # Phase new fields
        migrations.AddField(
            model_name='phase',
            name='is_open',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='phase',
            name='teams',
            field=models.ManyToManyField(blank=True, related_name='phases', to='api.team'),
        ),
    ]
